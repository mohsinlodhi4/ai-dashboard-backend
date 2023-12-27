const Role = require('../../models/role');

require('dotenv').config();
const connect = require('../connection');

connect().then( async ()=>{

    const roles = [
        {
            name: "admin",
        },
        // {
        //     name: "rider",
        // },
        // {
        //     name: "customer",
        // },
        {
            name: "user",
        },
    ];
    
    try {
        await Role.deleteMany();
        const res = await Role.insertMany(roles);
        console.log('yay!!', res);
      } catch (err) {
        // Handle errors
        console.log(err);
      }
      process.exit();
});


