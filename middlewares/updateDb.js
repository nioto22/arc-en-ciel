const models = require('../model/model')
const User = models.User

const updateType = {
    USER: 'user',
    EVENT: 'event',
    ALERT: 'alert',
    COMMENT: 'comment'
  };

async function updateChangeControl(updateType) {
    console.log(`Update change control ${updateType.$inc}`)
    try {
      const currentDate = new Date(); // get the current date
      let incValue;
      switch(updateType) {
        case updateType.USER:
          incValue = { userCount: 1 };
          break;
        case updateType.EVENT:
          incValue = { eventCount: 1 };
          break;
        case updateType.ALERT:
          incValue = { alertCount: 1 };
          break;
        case updateType.COMMENT:
          incValue = { commentCount: 1 };
          break;
        default:
          throw new Error(`Invalid update type: ${updateType}`);
      }
  
      const update = {
        $inc: incValue, // increment the eventCount field by 1
        date: currentDate // set the date field to the current date
      };
      const options = { new: true }; // return the updated document
      const updatedControl = await ChangeControl.findOneAndUpdate({}, update, options); // find and update the first document
      console.log('Updated Change Control:', updatedControl);
    } catch (err) {
      console.error(err);
    }
  }

  module.exports = updateChangeControl;