const Role = require('../..//models/role');
const User = require('../..//models/user');

require('dotenv').config();
const connect = require('../connection');

connect().then( async ()=>{

    // const roles = [
    //     {
    //         name: "admin",
    //     },
    //     {
    //         name: "rider",
    //     },
    //     {
    //         name: "customer",
    //     },
    // ];
    
    try {
        await User.deleteMany();
        // const res = await Role.insertMany(roles);
        // console.log('yay!!', res);
      } catch (err) {
        // Handle errors
        console.log(err);
      }
      process.exit();
});


