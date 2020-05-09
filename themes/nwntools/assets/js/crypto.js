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
