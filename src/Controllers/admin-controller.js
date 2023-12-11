const { ObjectId } = require('mongodb');
const {Category,Product,Inventory,User,jwt,Role} =require('./admin-index.js')


const categoryController = async (req, res) => {
  try {
    const { name } = req.body;
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, 'your-secret-key');

    if (!name) {
      return res.status(400).json({ message: 'Name and createdBy are required fields' });
    }

    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return res.status(409).json({ message: 'Category with the same name already exists' });
    }
    const user = await User.findOne({ email: decodedToken.email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const createdBy = user.name;


    const newCategory = new Category({ name, createdBy });
    await newCategory.save();

    const token1 = generateToken({ userId: decodedToken.userId, categoryId: newCategory._id, createdBy  });

    res.status(201).json({ message: 'Category created successfully', category: newCategory, token1 });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const productsController = async (req, res) => {
  try {
    const { name, price } = req.body;
   
    if (!name || !price) {
      return res.status(400).json({ message: 'Name and price are required fields' });
    }

    const categoryId = extractCategoryIdFromToken(req.headers.authorization);

    const existingCategory = await Category.findById(categoryId.categoryId);
    if (!existingCategory) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const newProduct = new Product({ name, price, category: categoryId.categoryId });
    const token1 = generateToken({ userId: categoryId.userId, productId: newProduct._id });

    await newProduct.save();

    res.status(201).json({ message: 'Product created successfully', product: newProduct, token1 });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const inventoryController = async (req, res) => {
  try {
    const { quantity } = req.body;

    if (!quantity) {
      return res.status(400).json({ message: 'Quantity is a required field' });
    }

    const productId = extractProductIdFromToken(req.headers.authorization);

    const existingProduct = await Product.findById(productId.productId);
    if (!existingProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const newInventory = new Inventory({ quantity, product: existingProduct._id });
    await newInventory.save();

    const token1 = generateToken({ userId: productId.userId, inventoryId: newInventory._id });
    res.status(201).json({ message: 'Inventory entry created successfully', inventory: newInventory, token1 });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};


const updateInventoryController = async (req, res) => {
  try {
    const { quantity } = req.body;

    if (!quantity) {
      return res.status(400).json({ message: 'Quantity is a required field' });
    }

    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, 'your-secret-key');
    // let inventoryId = decodedToken.inventoryId;
    console.log('decodedToken:', decodedToken);

    const existingInventory = await Inventory.findOne({ _id: new ObjectId(decodedToken.inventoryId) });

    if (!existingInventory) {
      return res.status(404).json({ message: 'Inventory entry not found' });
    }

    const updatedId = existingInventory._id
    if (decodedToken.inventoryId !== updatedId.toString()) {
      console.log('Mismatched userId:', decodedToken.inventoryId, updatedId);
      return res.status(403).json({ message: 'Unauthorized: You do not have permission to update this inventory entry' });
    }

    existingInventory.quantity = quantity;

    await existingInventory.save();

    res.status(200).json({ message: 'Inventory entry updated successfully', inventory: existingInventory });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};


const addProductController = async (req, res) => {
  try {
    const { name, category, createdBy, quantity, price } = req.body;

  
    if (!name || !category || !createdBy || !quantity || !price) {
      return res.status(400).json({ message: 'Name, category, createdBy, quantity, and price are required fields' });
    }

    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, 'your-secret-key');
    console.log(decodedToken)
    let userName = ''
    let existingUser = await User.findOne({ "email": decodedToken.email });

    if (existingUser) {
      userName = existingUser.name
    }

    let existingCategory = await Category.findOne({ "name": category });
    console.log(category)
    if (!existingCategory) {
      existingCategory = await new Category({ "name": category, "createdBy": userName }).save();
    }
    console.log(existingCategory)

    const newProduct = new Product({ name, category: existingCategory._id, createdBy, price });
    await newProduct.save();

    const newInventory = new Inventory({ quantity, product: newProduct._id });
    await newInventory.save();

    res.status(201).json({ message: 'Product and inventory entry created successfully', product: newProduct, inventory: newInventory });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};




const assignRoleByEmailController = async (req, res) => {
  try {
    const { email, roleName } = req.body;
    const token = req.headers.authorization.split(' ')[1];

    const decodedToken = jwt.verify(token, 'your-secret-key');

    if (!email || !roleName) {
      return res.status(400).json({ message: 'Email and roleName are required fields' });
    }

    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userRole = await Role.findOne({ name: roleName });
    if (!userRole) {
      return res.status(404).json({ message: 'Role not found' });
    }

    existingUser.roles = userRole._id;

    await existingUser.save();

    res.status(200).json({ message: 'Role assigned successfully', user: existingUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};



const generateToken = (data) => {
  return jwt.sign(data, 'your-secret-key', { expiresIn: '1h' });
};

const extractCategoryIdFromToken = (authorizationHeader) => {
  const token = authorizationHeader.split(' ')[1];
  const decodedToken = jwt.verify(token, 'your-secret-key');
  return decodedToken;
};

const extractProductIdFromToken = (authorizationHeader) => {
  const token = authorizationHeader.split(' ')[1];
  const decodedToken = jwt.verify(token, 'your-secret-key');
  return decodedToken;
};



module.exports = { addProductController, assignRoleByEmailController, categoryController, productsController, inventoryController, updateInventoryController };

