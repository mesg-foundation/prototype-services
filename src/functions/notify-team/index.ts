import * as Sendgrid from "sendgrid";

const templates = {
  TRIGGER_DISABLED: (data) => ({
    content: `The trigger ${data.trigger.id} as been desactivated`,
    title: "A trigger has been desactivated",
  }),
  TRIGGER_ERROR: (data) => ({
    content: `The trigger ${data.trigger.id} fails to execute, please check the details on your dashboard`,
    title: "Your trigger fails",
  }),
};
const fromEmail = new Sendgrid.mail.Email("no-reply@etherstellar.com", "EtherStellar");

const generateMail = (data) => {
  const { title, content } = templates[data.kind](data);
  return new Sendgrid.mail.Mail(
    fromEmail,
    title,
    new Sendgrid.mail.Email(data.project.users.map((x) => x.email).join(";")),
    new Sendgrid.mail.Content("text/plain", content),
  );
};

export default (event) => {
  const notification = event.data.Notification.node;
  // notification.trigger.notifications[0]
  // is the one just created so we take the one just before
  const lastNotification = notification.trigger.notifications[1];
  const delay = 1 * 24 * 60 * 60 * 1000; // 1 day
  const sendgridInstance = Sendgrid(process.env.SENDGRID_SECRET || "");
  const lastNotificationDate = lastNotification
    ? +new Date(lastNotification.createdAt)
    : null;

  return lastNotificationDate && lastNotificationDate > +new Date() - delay
    ? Promise.resolve({ error: "NOTIFICATION_SENT_ALREADY" })
    : sendgridInstance
      .API(sendgridInstance.emptyRequest({
        body: generateMail(notification).toJSON(),
        method: "POST",
        path: "/v3/mail/send",
      }));
};
