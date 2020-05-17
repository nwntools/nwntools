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


function to_ig_writable(s, title) {
  output = "@write title " + title + "\n\n@write ";
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

var error_messages = [];

function in_alphabet(alphabet, phrase, otp, message) {
  var char_pos_map = alphabet_to_dict(alphabet.value);
  invalid_chars = "";
  to_check = [
    ["Phrase", phrase],
    ["One Time Pad", otp],
    ["Message", message]
  ];
  for (var i = 0; i < to_check.length; i++) {
    var labelled_field = to_check[i];
    str = labelled_field[1].value;
    for (var j = 0; j < str.length; j++) {
      if (!char_pos_map.hasOwnProperty(str[j])) {
        if (str[j] == " ") {
          new_char = "<space>";
        }
        else {
          new_char = str[j];
        }
        if (invalid_chars.indexOf(new_char) == -1) {
          invalid_chars += new_char + " ";
        }
      }
    }
    if (invalid_chars.length > 0) {
      error_messages.push(labelled_field[0] + " characters not in alphabet: " + invalid_chars);
      invalid_chars = "";
    }
  }
}

function in_bounds(otp, message, otp_offset) {
  offset = Number(otp_offset.value);
  if (isNaN(offset)) {
    error_messages.push("The offset must be a number");
  }
  else if (!otp.value[offset]) {
    error_messages.push("The chosen offset is too high or low for the One Time Pad");
  }
  else if (otp.value.length - offset < message.value.length) {
    error_messages.push("There is only space for " + (otp.value.length - offset) + " characters in the message");
  }
}

function input_valid() {
  var message = document.getElementById("message");
  var phrase = document.getElementById("phrase");
  var otp = document.getElementById("otp");
  var otp_offset = document.getElementById("otp-offset");
  var alphabet = document.getElementById("alphabet");

  // Check
  in_alphabet(alphabet, phrase, otp, message);
  in_bounds(otp, message, otp_offset);

  // error messages to DOM
  if (error_messages.length > 0) {
    var errors_box = document.getElementById("error-messages");
    var error_node;
    for (var i = 0; i < error_messages.length; i++) {
      error_node = document.createElement("p");
      error_node.innerText = error_messages[i];
      errors_box.appendChild(error_node);
    }
    errors_box.classList.remove("is-hidden");
    return false;
  }
  else {
    return true;
  }
}

function clean_errors() {
  while (error_messages.length > 0) {
    error_messages.pop();
  }
  var errors_box = document.getElementById("error-messages");
  errors_box.classList.add("is-hidden");
  var children = errors_box.children;
  var child_collection = [];
  for (var i = 1; i < children.length; i++) {
    child_collection.push(children[i]);
  }
  for (var i = 0; i < child_collection.length; i++) {
    child_collection[i].remove();
  }
}

function encrypt() {

  // Input validation
  clean_errors();
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
  ig_writable.value = to_ig_writable(preamble + otp_cipher, "Cryptic Writings");
}

function decrypt() {

  // Input validation
  clean_errors();
  if (!input_valid()) {
    return;
  }

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
  ig_writable.value = to_ig_writable(message, "Writings");
}
