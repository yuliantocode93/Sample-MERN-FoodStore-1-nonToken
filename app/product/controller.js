const fs = require("fs"); // Mengimpor modul 'fs' (File System) untuk operasi file.
const config = require("../config"); // Mengimpor file konfigurasi dari direktori '../config'.
const Product = require("./model"); // Mengimpor model 'Product' dari file './model'.
const path = require("path"); // Mengimpor modul 'path' untuk manipulasi path file/direktori.
const Category = require("../category/model");
const Tag = require("../tag/model");

//* POST a Data
const store = async (req, res, next) => {
  // Fungsi untuk menyimpan data produk baru.
  try {
    let payload = req.body; // Mengambil data dari permintaan (request) HTTP.

    if (payload.category) {
      let category = await Category.findOne({ name: { $regex: payload.category, $options: "i" } });
      if (category) {
        payload = { ...payload, category: category._id };
      } else {
        delete payload.category;
      }
    }

    if (payload.tags && payload.tags.length > 0) {
      let tags = await Tag.find({ name: { $in: payload.tags } });
      if (tags.length) {
        payload.tags = tags.map((tag) => tag._id);
      } else {
        delete payload.tags;
      }
    }

    if (req.file) {
      // Jika ada file yang diunggah dalam permintaan.
      // Menyiapkan path dan nama file untuk disimpan.
      let tmp_path = req.file.path;
      let originalExt = req.file.originalname.split(".")[req.file.originalname.split(".").length - 1];
      let filename = req.file.filename + "." + originalExt;
      let target_path = path.resolve(config.rootPath, `../../public/images/products/${filename}`);

      // Membuat read stream dari file yang diunggah dan write stream menuju lokasi target.
      const src = fs.createReadStream(tmp_path);
      const dest = fs.createWriteStream(target_path);
      src.pipe(dest);

      // Menangani penyelesaian proses read stream.
      src.on("end", async () => {
        try {
          // Membuat objek produk baru dengan nama file gambar yang disimpan.
          let product = new Product({ ...payload, image_url: filename });
          await product.save(); // Menyimpan data produk ke dalam database.
          return res.json(product); // Mengembalikan respons JSON dengan data produk.
        } catch (err) {
          // Jika terjadi error, hapus file yang sudah diunggah.
          fs.unlinkSync(target_path);
          // Jika error merupakan ValidationError, kirim respons JSON dengan pesan error validasi.
          if (err && err.name === "ValidationError") {
            return res.json({
              error: 1,
              message: err.message,
              fields: err.errors,
            });
          }
          next(err); // Lanjutkan ke middleware error handler.
        }
      });
      // Menangani error pada proses read stream.
      src.on("error", async (err) => {
        next(err); // Lanjutkan ke middleware error handler.
      });
    } else {
      // Jika tidak ada file yang diunggah, simpan produk tanpa gambar.
      let product = new Product(payload);
      await product.save(); // Menyimpan data produk ke dalam database.
      return res.json(product); // Mengembalikan respons JSON dengan data produk.
    }
  } catch (err) {
    // Menangani error yang terjadi.
    if (err && err.name === "ValidationError") {
      return res.json({
        error: 1,
        message: err.message,
        fields: err.errors,
      });
    }
    next(err); // Lanjutkan ke middleware error handler.
  }
};

//* UPDATE by ID
const update = async (req, res, next) => {
  // Fungsi untuk memperbarui data produk berdasarkan ID.
  try {
    let payload = req.body; // Mengambil data dari permintaan (request) HTTP.
    let { id } = req.params; // Mengambil ID produk dari parameters request.

    if (payload.category) {
      let category = await Category.findOne({ name: { $regex: payload.category, $options: "i" } });
      if (category) {
        payload = { ...payload, category: category._id };
      } else {
        delete payload.category;
      }
    }

    if (payload.tags && payload.tags.length > 0) {
      let tags = await Tag.find({ name: { $in: payload.tags } });
      if (tags.length) {
        payload.tags = tags.map((tag) => tag._id);
      } else {
        delete payload.tags;
      }
    }

    let existingProduct = await Product.findById(id); // Mencari produk yang sudah ada berdasarkan ID.

    if (req.file) {
      // Jika ada file yang diunggah dalam permintaan.
      // Menyiapkan path dan nama file baru untuk disimpan.
      let tmpPath = req.file.path;
      let originalExt = req.file.originalname.split(".")[req.file.originalname.split(".").length - 1];
      let filename = req.file.filename + "." + originalExt;
      let targetPath = path.resolve(config.rootPath, `../../public/images/products/${filename}`);

      // Membuat read stream dari file yang diunggah dan write stream menuju lokasi target baru.
      const src = fs.createReadStream(tmpPath);
      const dest = fs.createWriteStream(targetPath);
      src.pipe(dest);

      // Menangani penyelesaian proses read stream.
      src.on("end", async () => {
        try {
          // Jika produk sebelumnya memiliki gambar, hapus gambar tersebut dari sistem file.
          if (existingProduct.image_url) {
            let currentImage = path.resolve(config.rootPath, `../../public/images/products/${existingProduct.image_url}`);
            if (fs.existsSync(currentImage)) {
              fs.unlinkSync(currentImage);
            }
          }

          // Memperbarui produk dengan gambar baru dan detail lainnya di database.
          let updatedProduct = await Product.findByIdAndUpdate(
            id,
            { ...payload, image_url: filename },
            {
              new: true,
              runValidators: true,
            }
          );

          return res.json(updatedProduct); // Mengembalikan respons JSON dengan data produk yang diperbarui.
        } catch (err) {
          fs.unlinkSync(targetPath); // Jika terjadi error, hapus file yang sudah diunggah.
          next(err); // Lanjutkan ke middleware error handler.
        }
      });

      // Menangani error pada proses read stream.
      src.on("error", async (err) => {
        next(err); // Lanjutkan ke middleware error handler.
      });
    } else {
      // Jika tidak ada file yang diunggah, update produk tanpa mengubah gambar.
      let updatedProduct = await Product.findByIdAndUpdate(id, payload, {
        new: true,
        runValidators: true,
      });
      return res.json(updatedProduct); // Mengembalikan respons JSON dengan data produk yang diperbarui.
    }
  } catch (err) {
    // Menangani error yang terjadi.
    next(err); // Lanjutkan ke middleware error handler.
  }
};

//* Get All
//* GET: Index function to fetch products based on certain criteria
const index = async (req, res, next) => {
  try {
    // Filter
    let { skip = 0, limit = 100, q = "", category = "", tags = [] } = req.query;

    let criteria = {}; // Criteria object for filtering products

    // Search by name (if 'q' parameter is provided)
    if (q.length) {
      criteria = {
        ...criteria,
        name: { $regex: new RegExp(`${q}`, "i") },
      };
    }

    // Search by category (if 'category' parameter is provided)
    if (category.length) {
      let categoryResult = await Category.find({ name: { $regex: new RegExp(`${category}`, "i") } });
      if (categoryResult.length > 0) {
        criteria = { ...criteria, category: categoryResult[0]._id };
      }
    }

    // Search by tags (if 'tags' parameter is provided)
    if (tags.length) {
      let tagsResult = await Tag.find({ name: { $in: tags } });
      if (tagsResult.length > 0) {
        criteria = { ...criteria, tags: { $in: tagsResult.map((tag) => tag._id) } };
      }
    }
    // Count
    // Get the total count of products
    let count = await Product.find().countDocuments();

    // Pagination
    // Retrieve products based on criteria, applying pagination and populating category and tags fields
    let products = await Product.find(criteria).skip(parseInt(skip)).limit(parseInt(limit)).populate("category").populate("tags");

    return res.json({ data: products, count });
  } catch (err) {
    // Handle errors
    next(err);
  }
};

//* Delete by Id
const destroy = async (req, res, next) => {
  // Fungsi untuk menghapus produk berdasarkan ID.
  try {
    let product = await Product.findByIdAndDelete(req.params.id); // Menghapus produk dari database berdasarkan ID.
    let currentImage = `${config.rootPath}../../public/images/products/${product.image_url}`;
    if (fs.existsSync(currentImage)) {
      // Jika gambar produk ada di sistem file.
      fs.unlinkSync(currentImage); // Hapus gambar produk dari sistem file.
    }

    return res.json(product); // Mengembalikan respons JSON dengan produk yang dihapus.
  } catch (err) {
    // Menangani error yang terjadi.
    next(err); // Lanjutkan ke middleware error handler.
  }
};

module.exports = {
  // Ekspor fungsi-fungsi yang telah didefinisikan.
  store,
  index,
  update,
  destroy,
};
