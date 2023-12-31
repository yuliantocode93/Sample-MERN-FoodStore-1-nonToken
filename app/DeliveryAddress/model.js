const mongoose = require("mongoose");
const { model, Schema } = mongoose;

const deliveryAddressSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Nama alamat harus diisi"],
      maxLength: [255, "Panjang maksimal alamat adalah 255 karakter"],
    },
    kelurahan: {
      type: String,
      required: [true, "Kelurahan harus diisi"],
      maxLength: [255, "Panjang maksimal keluarahan adalah 255 karakter"],
    },
    kecamatan: {
      type: String,
      required: [true, "kecamatan harus diisi"],
      maxLength: [255, "Panjang maksimal kecamatan adalah 255 karakter"],
    },
    kabupaten: {
      type: String,
      required: [true, "kabupaten harus diisi"],
      maxLength: [255, "Panjang maksimal kabupaten adalah 255 karakter"],
    },
    provinsi: {
      type: String,
      required: [true, "provisi harus diisi"],
      maxLength: [255, "Panjang maksimal provinsi adalah 255 karakter"],
    },
    detail: {
      type: String,
      required: [true, "Nama alamat harus diisi"],
      maxLength: [255, "Panjang maksimal detail adalah 255 karakter"],
    },
  },
  { timestamps: true }
);

module.exports = model("DeliveryAddress", deliveryAddressSchema);
