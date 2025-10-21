

const Mailgen = require("mailgen");






const appointmentSuccessEmail = (name, appointment) => {
    return {
      body: {
        name: name || "Valued Patient",
        intro: "Your appointment has been successfully booked!",
        table: {
          data: [
            {
              "Doctor": appointment?.docData?.user?.name || "N/A",
              "Patient": appointment?.userData?.name || "N/A",
              "Date": appointment?.slotDate || "N/A",
              "Time": appointment?.slotTime || "N/A",
              "Fees": `$${appointment?.docData?.fees || 0}`,
            },
          ],
          columns: {
            customWidth: {
              Doctor: "20%",
              Patient: "20%",
              Date: "20%",
              Time: "20%",
              Fees: "10%",
            },
            customAlignment: {
              Doctor: "left",
              Patient: "left",
              Date: "center",
              Time: "center",
              Fees: "right",
            }
          }
        },
        action: {
          instructions: "You can view and manage your appointments from your dashboard:",
          button: {
            color: "#48cfad",
            text: "Go to Dashboard",
            link: "https://regno-hospital-api.onrender.com"


           
          },
        },
        outro: "Thank you for choosing Regno Hospital. We wish you good health!"
      }
    };
  };
  
  module.exports = {
    appointmentSuccessEmail,
  };
  

