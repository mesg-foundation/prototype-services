module.exports = {
  TRIGGER_DISABLED: data => ({
    title: 'A trigger has been desactivated',
    content: `The trigger ${data.trigger.id} as been desactivated`
  }),
  TRIGGER_ERROR: data => ({
    title: 'Your trigger fails',
    content: `The trigger ${data.trigger.id} fails to execute, please check the details on your dashboard`
  })
}