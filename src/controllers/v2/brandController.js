const { BrandV2 } = require("../../models/v2");
const { uploadFileToStorage, validateImageFile } = require("../../utils/uploadFile");

// Create a brand
exports.createBrand = async (req, res) => {
  try {
    const brandData = req.body;

    // Generate slug from name
    const slug = brandData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    // Handle logo upload
    if (req.file) {
      try {
        validateImageFile(req.file);
        const uploadResult = await uploadFileToStorage(req.file);
        brandData.logo = uploadResult.downloadUrl;
      } catch (uploadError) {
        console.error("Logo upload failed:", uploadError);
        return res.status(400).json({
          success: false,
          error: `Failed to upload logo: ${uploadError.message}`,
        });
      }
    }

    const brand = new BrandV2({
      ...brandData,
      slug,
    });

    await brand.save();
    res.status(201).json({ success: true, brand });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Get all brands
exports.getBrands = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      sort = "name",
      isActive = true,
      search,
    } = req.query;

    const filter = { isActive };

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { countryOrigin: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;
    const brands = await BrandV2.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));

    const total = await BrandV2.countDocuments(filter);

    res.json({
      success: true,
      brands,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Get a brand by ID
exports.getBrandById = async (req, res) => {
  try {
    const brand = await BrandV2.findById(req.params.id);
    
    if (!brand) {
      return res.status(404).json({ success: false, error: "Brand not found" });
    }

    res.json({ success: true, brand });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Get a brand by slug
exports.getBrandBySlug = async (req, res) => {
  try {
    const brand = await BrandV2.findOne({
      slug: req.params.slug,
      isActive: true,
    });
    
    if (!brand) {
      return res.status(404).json({ success: false, error: "Brand not found" });
    }

    res.json({ success: true, brand });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Update a brand
exports.updateBrand = async (req, res) => {
  try {
    const brandData = req.body;
    const brandId = req.params.id;

    // Handle name change and slug generation
    if (brandData.name) {
      const slug = brandData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      brandData.slug = slug;
    }

    // Handle logo upload
    if (req.file) {
      try {
        validateImageFile(req.file);
        const uploadResult = await uploadFileToStorage(req.file);
        brandData.logo = uploadResult.downloadUrl;
      } catch (uploadError) {
        console.error("Logo upload failed:", uploadError);
        return res.status(400).json({
          success: false,
          error: `Failed to upload logo: ${uploadError.message}`,
        });
      }
    }

    const brand = await BrandV2.findByIdAndUpdate(
      brandId,
      brandData,
      { new: true }
    );

    if (!brand) {
      return res.status(404).json({ success: false, error: "Brand not found" });
    }

    res.json({ success: true, brand });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Delete a brand
exports.deleteBrand = async (req, res) => {
  try {
    const brand = await BrandV2.findByIdAndDelete(req.params.id);
    
    if (!brand) {
      return res.status(404).json({ success: false, error: "Brand not found" });
    }

    res.json({ success: true, message: "Brand deleted successfully" });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

