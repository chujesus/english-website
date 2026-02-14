const nodemailer = require("nodemailer");
const fs = require("fs").promises; // Use fs.promises to read the template file

/**
 * Send a password reset email to the user.
 *
 * @param {*} user - User object containing user details.
 * @returns {Promise} - A promise that resolves when the email is sent successfully.
 */
const sendPasswordResetEmail = (user) => {
  return new Promise(async (resolve, reject) => {
    const subject = "Solicitud de cambio de contraseña";
    const first_name = user.first_name != null ? user.first_name : "";
    const last_name = user.last_name != null ? user.last_name : "";
    const userFullName = `${user.name} ${first_name} ${last_name}`;

    try {
      // SMTP server configuration
      const transporter = nodemailer.createTransport({
        host: process.env.MAIL_HOST,
        port: process.env.MAIL_PORT, // SMTP port (465 for SSL)
        secure: true, // false for TLS0; true for SSL
        auth: {
          // TODO: replace `user` and `pass` values from <https:// forwardemail.net>
          user: process.env.MAIL_USERNAME,
          pass: process.env.MAIL_PASSWORD,
        },
      });

      // Read the content of the HTML email template file
      const filePath = "./src/helpers/templates/reset-password.html"; // Update the file path
      const fileContent = await fs.readFile(filePath, "utf-8"); // Read content file

      const resetPasswordLink = `${process.env.URL_HOST}#/auth/change-password/${user.id}/${user.password_token}`;
      // Check if the tags exist in the file before replacing them
      if (
        fileContent.includes("#FullName") &&
        fileContent.includes("#resetPassword") &&
        fileContent.includes("#ClientName")
      ) {
        const body = fileContent
          .replace("#FullName", userFullName)
          .replace("#resetPassword", resetPasswordLink)
          .replace("#ClientName", process.env.MAIL_CLIENTNAME);

        // Email Configuration
        const mailOptions = {
          from: `"${process.env.MAIL_CLIENTNAME}" <${process.env.MAIL_USERNAME}>`,
          to: user.email,
          subject: subject,
          html: body,
        };

        // Send the email
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.error("Error sending the email:", error);
            reject(error); // Reject the promise if there's an error
          } else {
            console.log("Email sent:", info.response);
            resolve(); // Resolve the promise when the email is sent successfully
          }
        });
      } else {
        console.error("Some tags were not found in the template file");
        reject("Tags not found in the template file"); // Reject the promise if tags are not found
      }
    } catch (error) {
      reject(error); // Reject the promise if an error occurs during the process
    }
  });
};

/**
 * Sends a notification email to the user with document reminder.
 * @param {*} user - User object containing user details.
 * @returns {Promise<string>} - A promise that resolves with the response when the email is sent successfully.
 */
const sendNotificationFile = (user) => {
  return new Promise(async (resolve, reject) => {
    const subject = "Recordatorio de documentos";
    const first_name = user.first_name != null ? user.first_name : "";
    const last_name = user.last_name != null ? user.last_name : "";
    const userFullName = `${user.name} ${first_name}  ${last_name}`;

    try {
      // SMTP server configuration
      const transporter = nodemailer.createTransport({
        host: process.env.MAIL_HOST,
        port: process.env.MAIL_PORT,
        secure: true,
        auth: {
          user: process.env.MAIL_USERNAME,
          pass: process.env.MAIL_PASSWORD,
        },
      });

      // Read the content of the HTML email template file
      const filePath = "./src/helpers/templates/files-notification.html";
      const fileContent = await fs.readFile(filePath, "utf-8");

      // Check if the tags exist in the file before replacing them
      if (
        fileContent.includes("#FullName") &&
        fileContent.includes("#ClientName")
      ) {
        const body = fileContent
          .replace("#FullName", userFullName)
          .replace("#ClientName", process.env.MAIL_CLIENTNAME);

        // Email Configuration
        const mailOptions = {
          from: `"${process.env.MAIL_CLIENTNAME}" <${process.env.MAIL_USERNAME}>`,
          to: user.email,
          subject: subject,
          html: body,
        };

        // Send the email
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.error("Error sending the email:", error);
            reject(error);
          } else {
            console.log("Email sent:", info.response);
            resolve(info.response);
          }
        });
      } else {
        console.error("Some tags were not found in the template file");
        reject("Tags not found in the template file");
      }
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = {
  sendPasswordResetEmail,
  sendNotificationFile,
};
