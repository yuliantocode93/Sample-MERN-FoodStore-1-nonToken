const { police_check } = require("../../middlewares");
const deliveryAddressController = require("./controller");

const router = require("express").Router();

router.get("/deleveryAddress", deliveryAddressController.getAll);
router.post("/deleveryAddress", police_check("create", "DeliveryAddress"), deliveryAddressController.store);
router.put("/deleveryAddress/:id", police_check("update", "DeliveryAddress"), deliveryAddressController.updateById);
router.delete("/deleveryAddress/:id", police_check("delete", "DeliveryAddress"), deliveryAddressController.deleteById);

module.exports = router;
