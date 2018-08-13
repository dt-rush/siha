'use strict';

const randomErrorDescriptions = [
  "uh oh",
  "a bad happened",
  "i accidentally build a shelf",
  "something fell in the back",
  "the birds escaped"
];

exports.randomErrorDescription = () => {
  return randomErrorDescriptions[Math.floor(Math.random() * randomErrorDescriptions.length)]; 
};
