const router = require("express").Router();
const multer = require("multer");
const os = require("os");
const productController = require("./controller");

// Middleware setup for multer
const upload = multer({ dest: os.tmpdir() });

router.get("/products", productController.index);

// Route for creating a product
router.post(
  "/products",
  upload.single("image"), // File upload middleware placed after permission check
  productController.store
);

// Route for updating a product
router.put(
  "/products/:id",
  upload.single("image"), // File upload middleware placed after permission check
  productController.update
);

// Route for deleting a product
router.delete("/products/:id", productController.destroy);

module.exports = router;
