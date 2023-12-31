const Categories = require("./model");

//* Fungsi untuk menyimpan (Create) data baru ke dalam database
const store = async (req, res, next) => {
  try {
    let payload = req.body; // Mengambil data dari request body
    let category = new Categories(payload); // Membuat instance baru dari model Categories dengan data payload
    await category.save(); // Menyimpan data ke dalam database
    return res.json(category); // Mengembalikan data yang berhasil disimpan dalam format JSON
  } catch (err) {
    // Menangani kesalahan saat validasi data
    if (err && err.name === "ValidationError") {
      return res.json({
        error: 1,
        message: err.message,
        fields: err.errors,
      });
    }

    next(err); // Melanjutkan ke middleware error handler jika terdapat kesalahan lainnya
  }
};

//* Fungsi untuk memperbarui (Update) data yang sudah ada dalam database
const update = async (req, res, next) => {
  try {
    let payload = req.body; // Mengambil data dari request body
    // Mencari dan memperbarui data berdasarkan ID yang diberikan
    let category = await Categories.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true });
    return res.json(category); // Mengembalikan data yang telah diperbarui dalam format JSON
  } catch (err) {
    // Menangani kesalahan saat validasi data
    if (err && err.name === "ValidationError") {
      return res.json({
        error: 1,
        message: err.message,
        fields: err.errors,
      });
    }

    next(err); // Melanjutkan ke middleware error handler jika terdapat kesalahan lainnya
  }
};

//* Fungsi untuk menghapus (Delete) data berdasarkan ID dari database
const destroy = async (req, res, next) => {
  try {
    // Mencari dan menghapus data berdasarkan ID yang diberikan
    let category = await Categories.findByIdAndDelete(req.params.id);
    return res.json(category); // Mengembalikan data yang telah dihapus dalam format JSON
  } catch (err) {
    // Menangani kesalahan saat validasi data
    if (err && err.name === "ValidationError") {
      return res.json({
        error: 1,
        message: err.message,
        fields: err.errors,
      });
    }

    next(err); // Melanjutkan ke middleware error handler jika terdapat kesalahan lainnya
  }
};

//* Fungsi untuk mengambil (Read) seluruh data kategori dari database
const index = async (req, res, next) => {
  try {
    // Mengambil semua data kategori dari database
    let category = await Categories.find();
    return res.json(category); // Mengembalikan data kategori dalam format JSON
  } catch (err) {
    // Menangani kesalahan saat validasi data
    if (err && err.name === "ValidationError") {
      return res.json({
        error: 1,
        message: err.message,
        fields: err.errors,
      });
    }
    next(err); // Melanjutkan ke middleware error handler jika terdapat kesalahan lainnya
  }
};

// Mengekspor semua fungsi agar dapat digunakan di file lain
module.exports = {
  store,
  update,
  destroy,
  index,
};
