const mongoose = require("mongoose");

mongoose.connect("mongodb+srv://diksha2710:YOUR_PASSWORD@cluster0.msbg2mw.mongodb.net/brixodb?retryWrites=true&w=majority&appName=Cluster0")
.then(() => {
    console.log(" Connected");
    process.exit(0);
})
.catch((err) => {
    console.log(err);
    process.exit(1);
});