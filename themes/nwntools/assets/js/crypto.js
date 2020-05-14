function mod(a, n) {
  return ((a % n) + n) % n;
}

function alphabet_to_dict(alphabet) {
  dict = {};
  for (i = 0; i < alphabet.length; i++) {
    dict[alphabet[i]] = i;
  }
  return dict;
}

function vigenere_encipher(message, phrase, alphabet) {
  var char_pos_map = alphabet_to_dict(alphabet);
  var cipher = "";
  var shift;

  for (i = 0; i < message.length; i++) {
    pos = char_pos_map[message[i]];
    shift = char_pos_map[phrase[mod(i, phrase.length)]]; //only change from otp
    cipher += alphabet[mod(pos + shift, alphabet.length)];
  }

  return cipher;
}

function vigenere_decipher(cipher, phrase, alphabet) {
  var char_pos_map = alphabet_to_dict(alphabet);
  var message = "";
  var shift;

  for (i = 0; i < cipher.length; i++) {
    pos = char_pos_map[cipher[i]];
    shift = char_pos_map[phrase[mod(i, phrase.length)]]; //only change from otp
    message += alphabet[mod(pos - shift, alphabet.length)];
  }

  return message;
}

function otp_encipher(message, otp, alphabet, otp_offset) {

  var char_pos_map = alphabet_to_dict(alphabet);
  var cipher = "";
  var shift;

  for (i = 0; i < message.length; i++) {
    pos = char_pos_map[message[i]];
    shift = char_pos_map[otp[i + otp_offset]];
    cipher += alphabet[mod(pos + shift, alphabet.length)];
  }

  return cipher;
}

function otp_decipher(cipher, otp, alphabet, otp_offset) {

  var char_pos_map = alphabet_to_dict(alphabet);
  var message = "";
  var shift;

  for (i = 0; i < cipher.length; i++) {
    pos = char_pos_map[cipher[i]];
    shift = char_pos_map[otp[i + otp_offset]];
    message += alphabet[mod(pos - shift, alphabet.length)];
  }

  return message;
}


function to_ig_writable(s) {
  output = "@write title Cryptic Writings\n\n@write ";
  maxmsglen = 227;
  for (var i = 0; i < s.length; i = i + maxmsglen) {
    output += s.substring(i, i + maxmsglen - 1) + "\n\n";
    if (i + maxmsglen < s.length) {
      output += "@write add ";
    }
  }
  return output;
}

function encrypt() {

  // Inputs
  var message = document.getElementById("message").value;
  var phrase = document.getElementById("phrase").value;
  var otp = document.getElementById("otp").value;
  var otp_offset = document.getElementById("otp-offset").value;
  var alphabet = document.getElementById("alphabet").value;

  // Output fields
  var output = document.getElementById("output");
  var ig_writable = document.getElementById("ig-writable");

  var vigenere_cipher = vigenere_encipher(message, phrase, alphabet);
  var otp_cipher = otp_encipher(vigenere_cipher, otp, alphabet, Number(otp_offset));
  output.value = otp_cipher;
  ig_writable.value = to_ig_writable(otp_cipher);
}

function decrypt() {

  // Inputs
  var cipher = document.getElementById("message").value;
  var phrase = document.getElementById("phrase").value;
  var otp = document.getElementById("otp").value;
  var otp_offset = document.getElementById("otp-offset").value;
  var alphabet = document.getElementById("alphabet").value;

  // Output fields
  var output = document.getElementById("output");
  var ig_writable = document.getElementById("ig-writable");

  var vigenere_cipher = otp_decipher(cipher, otp, alphabet, Number(otp_offset));
  var message = vigenere_decipher(vigenere_cipher, phrase, alphabet);
  output.value = message;
  ig_writable.value = to_ig_writable(message);
}
