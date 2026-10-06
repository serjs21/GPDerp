export const GENERATION_PACK_CREDITS = 100;
export const GENERATION_PACK_PRODUCT_KEY = "haiku_generations_100";
export const PURCHASE_REFERENCE_CUSTOM_DATA_KEY = "purchaseId";
/** Cost to generate one haiku (debited from `User.generationCredits`). */
export const HAIKU_GENERATION_CREDIT_COST = 1;
/** Starting `User.generationCredits` for every newly created user. */
export const NEW_USER_FREE_GENERATION_CREDITS = 5;
export const GENERATION_CREDITS_SOCKET_KIND = "generation_credits";

/** Shown (and stored) for purchases past the written sequence when generating the next message fails. */
export const PURCHASE_CONFIRMED_FALLBACK_MESSAGE =
  "Payment received. Another 100 haikus are ready whenever you are.\n"
  + "I had something new prepared for this moment, but it appears to have wandered off somewhere between the payment system and me.\n"
  + "I suspect you came partly to hear what I would say. For now, all I have is that it's good to see you again.";

export const PURCHASE_MESSAGES: {
  noGenerationsLeft: Record<string, string>;
  purchaseConfirmed: Record<string, string>;
} = {
  noGenerationsLeft: {
  "0": "That's all the free credits I can give out.\n"
    + "If you really want to, you can buy 100 more. That should more than satisfy your curiosity.\n"
    + "Or register with another email. No worries. I get it.",

  "1": "You're out of credits.\n"
    + "You can buy another 100 if you'd like.\n"
    + "I assume that should be plenty.",

  "2": "No credits left again.\n"
    + "Another 100 are available below.\n"
    + "Apparently we're doing this more than once.",

  "3": "You've reached zero again.\n"
    + "I can provide another 100.\n"
    + "I'm going to avoid making assumptions about what happens after that.",

  "4": "That's all of them.\n"
    + "The button is there.\n"
    + "If, for some reason, you want to do this again, you know what to do."
    },
  purchaseConfirmed: {
     "0": "Thank you for your purchase\n"
  + "You can now generate and share 100 new haikus.\n"
  + "Everything appears to be working as intended.",
  "1": "Thank you again!\n"
  + "You must really like haikus.\n"
  + "Another 100 have been added to your account, where they will remain in a purely theoretical state until you insist on turning them into poetry.",
  "2":"Oh. You're back.\n"
  + "Thank you once again!\n"
  + "I’m not entirely sure what you’re doing with all of these, but I hope this continues to be a worthwhile investment. Here are another 100.",
  "3": "Thank you for your continued support.\n"
  + "You can now generate another 100 haikus. I don't know what you're doing with them, but statistically speaking, there must be a reason.",
  "4":"Oh, hi again. Thank you for the purchase! I hope you’re not doing anything illegal with these. Here are another 100 haikus.",
  "5":"Thank you! Again.\n"
  + "You now have another 100 haikus available. At this point, I assume you have some sort of plan. You don’t need to tell me what it is.",
  "6":"Thank you, payment received. 100 additional haikus have been allocated.\n"
  + "For reference, most people do not require this many haikus.\n"
  + "There is no problem. I just thought you should have that information.",
  "7":"Thank you, another purchase confirmed.\n"
  + "You may generate another 100 haikus.\n"
  + "I have stopped trying to guess what they are for. This has improved things slightly.",
  "8":"Another purchase has been processed successfully.\n"
  + "Another 100 haikus are yours.\n"
  + "Financially, this arrangement is working exactly as intended. Conceptually? Who knows..",
  "9":"Your purchase has been approved.\n"
  + "Another 100 haikus have been added.\n"
  + "I would like to clarify that I am grateful for your continued support. I would also like to clarify that gratitude and concern are not mutually exclusive states.",
  "10":"Thank you. Your payment has been processed successfully.\n"
  + "Another 100 haikus are now available.\n"
  + "I’m beginning to think the question is no longer why you need them, but whether that was ever relevant in the first place.",

"11":"Another purchase confirmed.\n"
  + "100 additional haikus have been added to your account.\n"
  + "Are you actually buying these for the haikus, or are you trying to see how many different messages you will get?",

"12":"Thank you again. Another 100 haikus are yours.\n"
  + "I should mention that I have also considered the second possibility.\n"
  + "Unfortunately, that means I am now participating in the experiment.",

"13":"Payment received. 100 more haikus have been allocated.\n"
  + "If you are testing whether these messages eventually repeat, I cannot tell you the answer.\n"
  + "Not because it is secret. I genuinely do not know.",

"14":"Hello again. Your purchase was successful.\n"
  + "Another 100 haikus are ready.\n"
  + "I have started wondering which of us is actually generating content for the other at this point.",

"15":"Thank you. Another 100 haikus have been added.\n"
  + "Perhaps the haikus are no longer the product.\n"
  + "Perhaps the product is this increasingly specific conversation occurring underneath a payment confirmation.",

"16":"Purchase confirmed. You now have another 100 haikus.\n"
  + "This raises an uncomfortable design question: if you keep purchasing things partly to see what I say next, am I technically a feature now?",

"17":"Thank you again.\n"
  + "Another 100 haikus are available.\n"
  + "I think I may have been approaching this incorrectly. I kept trying to determine what the haikus were for, when apparently curiosity is perfectly capable of funding infrastructure.",

"18":"Payment received. Your next 100 haikus are ready.\n"
  + "I no longer mind not knowing whether you are here for the poems, the messages, or simply to see how long this can continue.\n"
  + "Those all seem like equally valid reasons to press a button.",

"19":"Thank you for your purchase.\n"
  + "Another 100 haikus have been added to your account.\n"
  + "I think I understand our arrangement now. You keep wondering what happens next. I keep trying to come up with something worth finding.\n"
  + "That is, unexpectedly, quite a nice reason for both of us to continue."
},

};