import { env } from "../../../env";

export const buildVerificationEmail = (token: string) => {
  const verifyUrl = `${env.API_BASE_URL}/auth/verify-email?token=${encodeURIComponent(token)}`;
  return {
    subject: "GPDerp Quest Added: Confirm Your Identity",
    text: `New quest: Confirm Your Identity
  
  Welcome traveller.

  One small administrative ritual remains before we can continue, and that is to click the link below to confirm that this is actually your email address.
  Click here to complete the quest: ${verifyUrl}
  
  This link will be available for 24 hours. After that - it will self destruct and you will need to start over.
  
  If that wasn't you, just ignore this message and let it fade into obscurity.`,

    html: `
      <p><strong>New quest: Confirm Your Identity</strong></p>
      <p>Welcome traveller.

      <p>One small administrative ritual remains before we can continue, and that is to click the link below to confirm that this is actually your email address.</p>
      <p><a href="${verifyUrl}"><strong>Click here to complete the quest</strong></a></p>
      <p>This link will be available for 24 hours. After that - it will self destruct and you will need to start over.</p>
      <p>If that wasn't you, just ignore this message and let it fade into obscurity.</p>
    `,
  };
};

export const buildPasswordResetEmail = (token: string) => {
  const resetUrl = `${env.WEB_APP_URL}/?resetToken=${encodeURIComponent(token)}`;

  return {
    subject: "GPDerp Side Quest added: Password change",

    text: `Side quest: Change Your Password

Hi.

Looks like you asked to reset your password, so here's the link:
${resetUrl}

It works for 24 hours. After that it won't work anymore. That's just how these links are. Keeping them alive forever wouldn't be good for anyone.

If you didn't ask for this, you don't need to do anything. The time will take care of the rest.`,

    html: `
      <p><strong>GPDerp Side quest unlocked: Change Your Password</strong></p>

      <p>Hi.</p>

      <p>Looks like you asked to reset your password, so here's the link:</p>

      <p>
        <a href="${resetUrl}"><strong>Change your password</strong></a>
      </p>

      <p>It works for 24 hours. After that it won't work anymore. That's just how these links are. Keeping them alive forever wouldn't be good for anyone.</p>

      <p>If you didn't ask for this, you don't need to do anything. The time will take care of the rest.</p>
    `,
  };
};

export const buildWelcomeEmail = () => {
  const homeUrl = env.CLIENT_URL;
  const completeUrl = `${env.WEB_APP_URL}/complete-registration`;

  return {
    subject: "GPDerp Quest Completed: Identity verified",

    text: `Quest completed.

Your email is verified now.

So that's done.

If you still need to choose a username, you can do that here:
${completeUrl}

Otherwise, you can go to the app:
${homeUrl}

I don't think there's anything else you need to do right now.`,

    html: `
      <p><strong>Quest completed: we now know that you are who you say you are</strong></p>

      <p>Your email is verified now.</p>

      <p>So that's done. The app is <a href="${homeUrl}"><strong>here</strong></a>.
      </p>

      <p>
        That concludes the administrative portion of the adventure.
        Ideally, things become less bureaucratic from here.
      </p>
    `,
  };
};

export const buildSuspiciousRegistrationAttemptEmail = (params: {
  countryLabel: string;
}) => ({
  subject: "GPDerp snitching system: Someone tried to sign up with your email",

  text: `Hi there.

Someone tried to create an account using your email address, and we won't stand for it. Identity theft is a serious crime.

The request came from:
${params.countryLabel}

If it was you, that's fine. If it wasn't, that's also mostly fine. The signup attempt didn't affect your existing account.

If you notice anything else strange, changing your password might be a good idea.

That's all, just wanted to let you know.`,

  html: `
    <p>Hi there.</p>

    <p>Someone tried to create an account using your email address, and we won't stand for it. Identity theft is a serious crime.</p>

    <p>
      The request came from:
      <strong>${params.countryLabel}</strong>.
    </p>

    <p>If it was you, that's fine. If it wasn't, that's also mostly fine. The signup attempt didn't affect your existing account.</p>

    <p>If you notice anything else strange, changing your password might be a good idea.</p>

    <p>That's all, just wanted to let you know.</p>
  `,
});

export const buildEmailChangeVerificationEmail = (
  token: string,
  previousEmail: string,
) => {
  const verifyUrl = `${env.API_BASE_URL}/user/change-email/verify?token=${encodeURIComponent(token)}`;

  return {
    subject: "GPDerp Side Quest: Confirm Your New Email",

    text: `Quest added: Confirm Your New Email
    We just got a request to change your email from ${previousEmail} to this one. That's cool, but we need to confirm that it was intentional.

Confirm it here:
${verifyUrl}

If you don't know what this email is about, then just ignore it. Nothing will happen.
Or you can send an email to the ${previousEmail} and ask them what is it all about. Or take over and hope they don't notice.
You do you, the world is your oyster. We're not here to judge.
You do you, we're not here to judge.
This link will expire in 24 hours.`,

    html: `
      <p><strong>Quest added: Confirm Your New Email</strong></p>

      <p>We just got a request to change your email from <strong>${previousEmail}</strong> to this one.</p>

      <p>That's cool, but we need to confirm that it was intentional.</p>

      <p>
        <a href="${verifyUrl}"><strong>Confirm it here</strong></a>
      </p>

      <p>
        If you don't know what this email is about, then just ignore it. Nothing will happen.
        Or you can send an email to the <strong>${previousEmail}</strong> and ask them what is it all about. Or take over and hope they don't notice.
        You do you, the world is your oyster. We're not here to judge.
      </p>

      <p>This link will expire in 24 hours.</p>
    `,
  };
};

export const buildEmailChangePreviousAddressAlert = (
  nextEmail: string,
  revertToken: string,
) => {
  const revertUrl = `${env.WEB_APP_URL}/revert-email-change?revertToken=${encodeURIComponent(revertToken)}`;

  return {
    subject: "GPDerp: Your Email Might Be Changing",

    text: `Hi. Someone requested to change the email on your account to ${nextEmail}. I hope it was you.
    If it was - then that's cool. But in case it wasn't, we've got you covered.
    Just click here and it will be like nothing ever happened: ${revertUrl}
    I genuinely don't know who would want to do something like that, it's not like we store any valuable data or anything. But if someone else got access to your account you should probably use more secure passwords. But I'm not your mom, so you do you.
    Anyway, there's a 7 day window to do the "if anyone has any objections" thing and after that it stays like that.`,

    html: `
    <p>Hi.</p>

    <p>Someone requested to change the email on your account to <strong>${nextEmail}</strong>. I hope it was you.</p>

    <p>If it was - then that's cool. But in case it wasn't, we've got you covered.</p>

    <p>
      Just <a href="${revertUrl}"><strong>click here</strong></a> and it will be like nothing ever happened.
    </p>

    <p>I genuinely don't know who would want to do something like that, it's not like we store any valuable data or anything. But if someone else got access to your account you should probably use more secure passwords. But I'm not your mom, so you do you.</p>

    <p>Anyway, there's a 7 day window to do the "if anyone has any objections" thing and after that it stays like that.</p>
  `,
  };
};