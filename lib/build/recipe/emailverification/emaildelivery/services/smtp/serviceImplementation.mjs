import getEmailVerifyEmailContent from "./emailVerify";
function getServiceImplementation(transporter, from) {
  return {
    sendRawEmail: async function(input) {
      if (input.isHtml) {
        await transporter.sendMail({
          from: `${from.name} <${from.email}>`,
          to: input.toEmail,
          subject: input.subject,
          html: input.body
        });
      } else {
        await transporter.sendMail({
          from: `${from.name} <${from.email}>`,
          to: input.toEmail,
          subject: input.subject,
          text: input.body
        });
      }
    },
    getContent: async function(input) {
      return getEmailVerifyEmailContent(input);
    }
  };
}
export {
  getServiceImplementation
};
