var crypto_description = "[Each symbol here is represented by a rune from the Drithik alphabet]||";

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
  var str = s.trim();
  str = str.replace(/\n/g, "|");
  var output = "@write title " + title + "\n\n@write ";
  var maxmsglen = 180;
  for (var i = 0; i < str.length; i = i + maxmsglen) {
    output += str.substring(i, i + maxmsglen) + "\n\n";
    if (i + maxmsglen < str.length) {
      output += "@write add ";
    }
  }
  return output;
}

var error_messages = [];

function in_alphabet(alphabet, phrase, otp, message) {
  var char_pos_map = alphabet_to_dict(alphabet);
  invalid_chars = "";
  to_check = [
    ["Phrase", phrase],
    ["One Time Pad", otp],
    ["Message", message]
  ];
  for (var i = 0; i < to_check.length; i++) {
    var labelled_field = to_check[i];
    var str = labelled_field[1];
    for (var j = 0; j < str.length; j++) {
      if (!char_pos_map.hasOwnProperty(str[j])) {
        if (str[j] == "$") {
          new_char = "$(newline)";
        }
        else if (str[j] == "_") {
          new_char = "_(space)";
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
  var offset = Number(otp_offset);
  if (isNaN(offset)) {
    error_messages.push("The offset must be a number");
  }
  else if (!otp[offset]) {
    error_messages.push("The chosen offset is too high or low for the One Time Pad");
  }
  else if (otp.length - offset < message.length) {
    error_messages.push("There is only space for " + (otp.length - offset) + " characters in the message");
  }
}

function input_valid(message, phrase, otp, otp_offset, alphabet) {

  // Checks
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

// Make string suitable for processing
function crypto_str(s) {
  var new_s = (' ' + s).slice(1);
  new_s = new_s.replace(/ /g, "_");
  new_s = new_s.replace(/\n/g, "$");
  return new_s;
}

// Make string suitable for people
function real_str(s) {
  var new_s = (' ' + s).slice(1);
  new_s = new_s.replace(/_/g, " ");
  new_s = new_s.replace(/\$/g, "\n");
  console.log(new_s);
  return new_s;
}

// Creates random array of length ints with values of min - ceiling -1
function random_ints(length, min, ceiling) {

  // Fill the numeric_key with random alphabet indexes
  samples = new Uint8Array(Number(length));
  numeric_key = new Uint8Array(Number(length));
  var pos = 0;
  filling:
  while (true) {
    window.crypto.getRandomValues(samples);
    for (var i = 0; i < samples.length; i++) {
      if (samples[i] >= min && samples[i] < ceiling) {
        numeric_key[pos++] = samples[i];
        if (pos >= numeric_key.length) {
          break filling;
        }
      }
    }
  }
  return numeric_key;
}

function numeric_key_to_str(numeric_key, alphabet) {
  var otp = "";
  for (var i = 0; i < numeric_key.length; i++) {
    otp += alphabet[numeric_key[i]];
  }
  return otp;
}

// Creates random string of length from alphabet
function random_str(length, alphabet) {
  var numeric_key = random_ints(length, 0, alphabet.length);
  var otp = numeric_key_to_str(numeric_key, alphabet);
  return otp;
}

function make_otp() {
  var otp_output = document.getElementById("otp-output");
  var ig_writable_otp = document.getElementById("ig-writable-otp");
  var otp_length = document.getElementById("otp-length").value;
  var alphabet = document.getElementById("alphabet").value;

  var otp = random_str(Number(otp_length), alphabet);
  var key_id = random_str(3, alphabet.substring(0, Math.min(52, alphabet.length))); // a-zA-Z normally...or alphabet length

  // Create key ID and beginning and end of message in OTP
  otp = "@" + key_id + "@" + otp;

  otp_output.value = otp;

  // 1024 characters fit on paper, key_id = 5, crypto_desc = 71, 1024 - 76 = 948
  ig_writable_otp.value = to_ig_writable(crypto_description + otp, "Cryptic Writings");
}

function get_crypto_meta(s) {
  var m = s.match(/^@(.*)@/);
  if (m) {
    m = m[1];
    meta = { "label": m.match(/^.../)[0] };
    offset = m.match(/^...([0-9]+)-/);
    ceiling = m.match(/,([0-9]+)$/);
    if (offset && offset.length > 1) meta["offset"] = Number(offset[1]);
    if (ceiling && ceiling.length > 1) meta["ceiling"] = Number(ceiling[1]);
    return meta;
  }
  else {
    return null;
  }
}

function remove_crypto_meta(s) {
  return s.replace(/^@.*@/, "");
}

function encrypt() {

  // Inputs
  var message = document.getElementById("message").value;
  var phrase = document.getElementById("phrase").value;
  var otp = document.getElementById("otp").value;
  var otp_offset = document.getElementById("otp-offset").value;
  var alphabet = document.getElementById("alphabet").value;

  // Prepare message, phrase and otp
  message = crypto_str(message);
  phrase = crypto_str(phrase);
  var otp_meta = get_crypto_meta(otp);
  otp = remove_crypto_meta(otp);

  // Input validation
  clean_errors();
  if (!input_valid(message, phrase, otp, otp_offset, alphabet)) {
    return;
  }

  // Output fields
  var output = document.getElementById("output");
  var ig_writable = document.getElementById("ig-writable");

  // Encrypt
  var vigenere_cipher = vigenere_encipher(message, phrase, alphabet);
  var otp_cipher = otp_encipher(vigenere_cipher, otp, alphabet, Number(otp_offset));
  var cipher_meta = "@" + otp_meta["label"] + otp_offset + "-" + (Number(otp_offset) + otp_cipher.length) + "@";
  otp_cipher = cipher_meta + otp_cipher;
  output.value = otp_cipher;
  ig_writable.value = to_ig_writable(crypto_description + otp_cipher, "Cryptic Writings");
}

function decrypt() {

  // Inputs
  var cipher = document.getElementById("message").value;
  var phrase = document.getElementById("phrase").value;
  var otp = document.getElementById("otp").value;
  var otp_offset = document.getElementById("otp-offset").value;
  var alphabet = document.getElementById("alphabet").value;

  // Prepare inputs
  phrase = crypto_str(phrase);
  // TODO: if meta on cipher, match id with otp for input validation
  // TODO: if meta on cipher, use offset there instead of usual offset
  var cipher_meta = get_crypto_meta(otp);
  otp = remove_crypto_meta(otp);

  // Input validation
  clean_errors();
  if (!input_valid(cipher, phrase, otp, otp_offset, alphabet)) {
    return;
  }

  // Output fields
  var output = document.getElementById("output");
  var ig_writable = document.getElementById("ig-writable");

  var vigenere_cipher = otp_decipher(cipher, otp, alphabet, Number(otp_offset));
  var message = vigenere_decipher(vigenere_cipher, phrase, alphabet);
  output.value = real_str(message);
  ig_writable.value = to_ig_writable(output.value, "Writings");
}
