import Inventory from '../models/Inventory.js';

// @desc    Get all inventory items
// @route   GET /api/inventory
// @access  Private (Admin, Principal, Teacher, Staff)
export const getInventory = async (req, res, next) => {
  try {
    const items = await Inventory.find()
      .populate('lastUpdatedBy', 'name email role')
      .populate('logs.updatedBy', 'name email role')
      .sort({ itemName: 1 });
    res.status(200).json({ success: true, inventory: items });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single inventory item
// @route   GET /api/inventory/:id
// @access  Private (Admin, Principal, Teacher, Staff)
export const getInventoryById = async (req, res, next) => {
  try {
    const item = await Inventory.findById(req.params.id)
      .populate('lastUpdatedBy', 'name email role')
      .populate('logs.updatedBy', 'name email role');
    if (!item) {
      return res.status(404).json({ success: false, message: 'Inventory item not found' });
    }
    res.status(200).json({ success: true, inventory: item });
  } catch (error) {
    next(error);
  }
};

// @desc    Create inventory item
// @route   POST /api/inventory
// @access  Private (Admin, Principal, Teacher, Staff)
export const createInventory = async (req, res, next) => {
  const { itemName, quantity, category, condition, location, assignedTo } = req.body;

  try {
    const item = new Inventory({
      itemName,
      quantity,
      category,
      condition: condition || 'Good',
      location,
      assignedTo: assignedTo || 'Storage',
      lastUpdatedBy: req.user._id,
    });

    // Add initial log
    item.logs.push({
      action: 'Created',
      message: `Created item with initial quantity: ${quantity}`,
      updatedBy: req.user._id,
    });

    const savedItem = await item.save();
    const populatedItem = await Inventory.findById(savedItem._id).populate('lastUpdatedBy', 'name email role');

    // Emit socket event
    const io = req.app.get('io');
    if (io) {
      io.emit('inventory_created', populatedItem);
    }

    res.status(201).json({ success: true, inventory: populatedItem });
  } catch (error) {
    next(error);
  }
};

// @desc    Update inventory item
// @route   PUT /api/inventory/:id
// @access  Private (Admin, Principal, Teacher, Staff)
export const updateInventory = async (req, res, next) => {
  const { itemName, quantity, category, condition, location, assignedTo } = req.body;

  try {
    const item = await Inventory.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Inventory item not found' });
    }

    const logsToAdd = [];

    // Track changes for logs
    if (itemName !== undefined && itemName !== item.itemName) {
      logsToAdd.push({
        action: 'Rename',
        message: `Name changed from "${item.itemName}" to "${itemName}"`,
        updatedBy: req.user._id,
      });
      item.itemName = itemName;
    }

    if (quantity !== undefined && quantity !== item.quantity) {
      logsToAdd.push({
        action: 'Quantity Updated',
        message: `Quantity adjusted from ${item.quantity} to ${quantity}`,
        updatedBy: req.user._id,
      });
      item.quantity = quantity;
    }

    if (category !== undefined && category !== item.category) {
      item.category = category;
    }

    if (condition !== undefined && condition !== item.condition) {
      logsToAdd.push({
        action: 'Status Changed',
        message: `Condition changed from "${item.condition}" to "${condition}"`,
        updatedBy: req.user._id,
      });
      item.condition = condition;
    }

    if (location !== undefined && location !== item.location) {
      logsToAdd.push({
        action: 'Location Changed',
        message: `Location changed from "${item.location}" to "${location}"`,
        updatedBy: req.user._id,
      });
      item.location = location;
    }

    if (assignedTo !== undefined && assignedTo !== item.assignedTo) {
      logsToAdd.push({
        action: 'Assigned',
        message: `Assignment changed from "${item.assignedTo}" to "${assignedTo}"`,
        updatedBy: req.user._id,
      });
      item.assignedTo = assignedTo;
    }

    // Apply audit logs
    logsToAdd.forEach((log) => item.logs.push(log));

    item.lastUpdatedBy = req.user._id;
    await item.save();

    const updatedItem = await Inventory.findById(item._id)
      .populate('lastUpdatedBy', 'name email role')
      .populate('logs.updatedBy', 'name email role');

    // Emit socket event
    const io = req.app.get('io');
    if (io) {
      io.emit('inventory_updated', updatedItem);
    }

    res.status(200).json({ success: true, inventory: updatedItem });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete inventory item
// @route   DELETE /api/inventory/:id
// @access  Private (Admin, Principal, Teacher, Staff)
export const deleteInventory = async (req, res, next) => {
  try {
    const item = await Inventory.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Inventory item not found' });
    }

    await item.deleteOne();

    // Emit socket event
    const io = req.app.get('io');
    if (io) {
      io.emit('inventory_deleted', req.params.id);
    }

    res.status(200).json({ success: true, message: 'Inventory item removed successfully' });
  } catch (error) {
    next(error);
  }
};
