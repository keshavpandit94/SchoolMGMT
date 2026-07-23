import mongoose from 'mongoose';

const InventoryLogSchema = new mongoose.Schema({
  action: { type: String, required: true }, // e.g., 'Created', 'Quantity Updated', 'Assigned', 'Status Changed'
  message: { type: String, required: true },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  timestamp: { type: Date, default: Date.now },
});

const InventorySchema = new mongoose.Schema(
  {
    itemName: {
      type: String,
      required: true,
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },
    category: {
      type: String,
      required: true,
      trim: true, // e.g., Lab Equipment, Office Supplies, Sports Goods
    },
    condition: {
      type: String,
      enum: ['Good', 'Needs Repair', 'Damaged', 'Lost'],
      default: 'Good',
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    assignedTo: {
      type: String, // Can be user name, student name, department name, etc.
      default: 'Storage',
    },
    lastUpdatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    logs: [InventoryLogSchema],
  },
  {
    timestamps: true,
  }
);

const Inventory = mongoose.model('Inventory', InventorySchema);
export default Inventory;
