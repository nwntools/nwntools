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

// Precon:
// Postcon:
// Check that msg and key are in alphabet
// Check if otp used beyond bound
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


function to_ig_writable(s, preamble) {
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

function insertAfter(newNode, referenceNode) {
  referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}

function in_alphabet(alphabet, phrase, otp, message) {
  var char_pos_map = alphabet_to_dict(alphabet.value);
  msg = "";
  invalid_chars = "";
  in_a = true;
  to_check = [
    ["Phrase", phrase],
    ["One Time Pad", otp],
    ["Message", message]
  ];
  for (var i = 0; i < to_check.length; i++) {
    labelled_field = to_check[i];
    str = labelled_field[1].value;
    if (old_err = document.getElementById(labelled_field[1].id + "-error")) {
      old_err.remove();
    }
    labelled_field[1].classList.remove("is-danger");
    for (var j = 0; j < str.length; j++) {
      if (!char_pos_map.hasOwnProperty(str[j])) {
        if (invalid_chars.length > 0) {
          invalid_chars += ", ";
        }
        invalid_chars += str[j];
      }
    }
    if (invalid_chars.length > 0) {
      in_a = false;
      labelled_field[1].classList.add("is-danger");
      err = document.createElement("p");
      err.id = labelled_field[1].id + "-error";
      err.classList.value = "help is-danger";
      err.innerText = "Characters not in alphabet: " + invalid_chars;
      insertAfter(err, labelled_field[1].parentNode);
      invalid_chars = "";
    }
  }
  return in_a;
}

function in_bounds(otp, message, otp_offset) {
  offset = Number(otp_offset.value);
  if (!otp.value[offset]) {
    // Offset too long msg
    return false;
  }
  else if (otp.value.length - offset < message.value.length) {
    // Message is too long for the OTP key from offset.
    return false;
  }
  return true;
}

function input_valid() {
  var message = document.getElementById("message");
  var phrase = document.getElementById("phrase");
  var otp = document.getElementById("otp");
  var otp_offset = document.getElementById("otp-offset");
  var alphabet = document.getElementById("alphabet");

  if (!in_alphabet(alphabet, phrase, otp, message)) {
    return false;
  }
  else if (!in_bounds(otp, message, otp_offset)) {
    return false;
  }
  return true;
}

function encrypt() {

  // Input validation
  if (!input_valid()) {
    return;
  }

  // Inputs
  var message = document.getElementById("message").value;
  var phrase = document.getElementById("phrase").value;
  var otp = document.getElementById("otp").value;
  var otp_offset = document.getElementById("otp-offset").value;
  var alphabet = document.getElementById("alphabet").value;

  // Output fields
  var output = document.getElementById("output");
  var ig_writable = document.getElementById("ig-writable");

  // Encrypt
  var vigenere_cipher = vigenere_encipher(message, phrase, alphabet);
  var otp_cipher = otp_encipher(vigenere_cipher, otp, alphabet, Number(otp_offset));
  output.value = otp_cipher;
  preamble = "[There are strange runes written here, each represented by a character]||";
  ig_writable.value = to_ig_writable(preamble + otp_cipher);
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
