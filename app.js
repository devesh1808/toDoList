const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();
app.use(bodyParser.urlencoded({extended:true}));

app.use(express.static("public"));

app.set("view engine", "ejs");

// mongoose.connect("mongodb://localhost:27017/toDoListDB", {useNewUrlParser:true});

mongoose.connect("mongodb+srv://devesh1808:devudev18@cluster0.yhkdprd.mongodb.net/toDoListDB", {useNewUrlParser:true});

const itemsSchema = {
    name: String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
    name: "Eating"
});

const item2 = new Item({
    name: "Gym"
});

const item3 = new Item({
    name: "Sleeping"
});

const defaultItems = [item1,item2,item3];  //array

const listSchema = {
    name: String,
    items: [itemsSchema]  //means listSchema schema should have same type of array(items) as itemsSchema schema array
};

const List = mongoose.model("List", listSchema);

app.get('/',function(req,res){
    Item.find({}, function(err, foundItems){
        if(foundItems.length === 0) {
           Item.insertMany(defaultItems, function(err){
           if(err){
             console.log(err);
           } else {
             console.log("Successfully saved default items to DB");
           }
           });
           res.redirect("/");
    }  else {
        res.render('list',{listTitle: "Today", newListItems: foundItems});
    }
    });
});

app.get("/:customListName", function(req,res){     //express routing parameter concept
    const cusListname = _.capitalize(req.params.customListName);

    List.findOne({name:cusListname}, function(err, foundList){
        if(!err){
            if(!foundList){
                //Create a new list
                const list = new List({
                    name: cusListname,
                    items: defaultItems
                });
                list.save();
                res.redirect("/" + cusListname);
            } else {
                //Show an existing list
                res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
            }
        }
    });

    
});

app.post('/',function(req,res){
    const itemName = req.body.newItem;
    const listName = req.body.list;
    const item = new Item({
        name: itemName
    });

    if(listName === "Today"){
        item.save();
        res.redirect("/");
    } else {
        List.findOne({name:listName}, function(err, foundList){
            foundList.items.push(item);
            foundList.save();
            res.redirect("/" + listName);
        });
    }
    
});

app.post('/delete', function(req,res){
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;

    if(listName === "Today"){
        Item.findByIdAndRemove(checkedItemId, function(err){
            if(!err){
                console.log("Successfully deleted checked item.");
                res.redirect("/");
            }
        });
    } else {
        List.findOneAndUpdate({name:listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
            if(!err){
                res.redirect("/" + listName);
            }
        });
    }
    
});

app.listen('3000',function(){
    console.log('Server is running on port 3000');
});