import { Request, Response } from 'express';
import mongoose from 'mongoose';

// Ensure Mongo URI is defined
const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  throw new Error('MONGODB_URI environment variable is not defined');
}

// Connect to MongoDB
mongoose
  .connect(mongoUri)
  .then(() => {
    console.log('Connected to the database');
  })
  .catch((error: mongoose.Error) => {
    console.error('Error connecting to the database:', error.message);
  });

// Define the StatusChange schema
const statusChangeSchema = new mongoose.Schema({
  eip: {
    type: String,
    required: true,
  },
  fromStatus: {
    type: String,
    required: true,
  },
  toStatus: {
    type: String,
    required: true,
  },
  changeDate: {
    type: Date,
    required: true,
  },
  changedDay: {
    type: Number,
    required: true,
  },
  changedMonth: {
    type: Number,
    required: true,
  },
  changedYear: {
    type: Number,
    required: true,
  },
});
const EipStatusChange =
  mongoose.models.EipStatusChange ||
  mongoose.model('EipStatusChange', statusChangeSchema, 'eipstatuschanges');

const ErcStatusChange =
  mongoose.models.ErcStatusChange ||
  mongoose.model('ErcStatusChange', statusChangeSchema, 'ercstatuschanges');
const RipStatusChange =
  mongoose.models.RipStatusChange ||
  mongoose.model('RipStatusChange', statusChangeSchema, 'ripstatuschanges');

const handler = async (req: Request, res: Response) => {
  try {
    const EipfinalStatusByYear = await EipStatusChange.aggregate([
      {
        $match: {
          eip: { $nin: ['7212'] },
          category: { $nin: ['ERC', 'ERCs', 'Standards Track - ERC'] },
        },
      },
      {
        $sort: { eip: 1, changeDate: 1 }, // Sort by EIP and change date
      },
      {
        $group: {
          _id: { year: { $year: '$changeDate' }, eip: '$eip' },
          lastStatus: { $last: '$toStatus' },
          eipTitle: { $last: '$title' },
          eipCategory: { $last: '$category' }, // Include the category field
        },
      },
      {
        $group: {
          _id: '$_id.year',
          statusChanges: {
            $push: {
              eip: '$_id.eip',
              lastStatus: '$lastStatus',
              eipTitle: '$eipTitle',
              eipCategory: '$eipCategory', // Include the category field
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          year: '$_id',
          statusChanges: 1,
        },
      },
      {
        $sort: { year: 1 },
      },
    ]);

    const FrozenErcData = await EipStatusChange.aggregate([
      {
        $match: {
          category: { $in: ['ERC', 'ERCs', 'Standards Track - ERC'] },
        },
      },
      {
        $sort: { eip: 1, changeDate: 1 }, // Sort by EIP and change date
      },
      {
        $group: {
          _id: { year: { $year: '$changeDate' }, eip: '$eip' },
          lastStatus: { $last: '$toStatus' },
          eipTitle: { $last: '$title' },
          eipCategory: { $last: '$category' }, // Include the category field
        },
      },
      {
        $group: {
          _id: '$_id.year',
          statusChanges: {
            $push: {
              eip: '$_id.eip',
              lastStatus: '$lastStatus',
              eipTitle: '$eipTitle',
              eipCategory: '$eipCategory', // Include the category field
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          year: '$_id',
          statusChanges: 1,
        },
      },
      {
        $sort: { year: 1 },
      },
    ]);

    const ErcfinalStatusByYear = await ErcStatusChange.aggregate([
      {
        $match: { changeDate: { $gte: new Date('2023-11-01T00:00:00.000Z') } },
      },
      {
        $sort: { eip: 1, changeDate: 1 }, // Sort by EIP and change date
      },
      {
        $group: {
          _id: { year: { $year: '$changeDate' }, eip: '$eip' },
          lastStatus: { $last: '$toStatus' },
          eipTitle: { $last: '$title' },
          eipCategory: { $last: '$category' }, // Include the category field
        },
      },
      {
        $group: {
          _id: '$_id.year',
          statusChanges: {
            $push: {
              eip: '$_id.eip',
              lastStatus: '$lastStatus',
              eipTitle: '$eipTitle',
              eipCategory: '$eipCategory', // Include the category field
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          year: '$_id',
          statusChanges: 1,
        },
      },
      {
        $sort: { year: 1 },
      },
    ]);

    const RipfinalStatusByYear = await RipStatusChange.aggregate([
      {
        $match: { changeDate: { $gte: new Date('2023-11-01T00:00:00.000Z') } },
      },
      {
        $sort: { eip: 1, changeDate: 1 }, // Sort by EIP and change date
      },
      {
        $group: {
          _id: { year: { $year: '$changeDate' }, eip: '$eip' },
          lastStatus: { $last: '$toStatus' },
          eipTitle: { $last: '$title' },
          eipCategory: { $last: '$category' }, // Include the category field
        },
      },
      {
        $group: {
          _id: '$_id.year',
          statusChanges: {
            $push: {
              eip: '$_id.eip',
              lastStatus: '$lastStatus',
              eipTitle: '$eipTitle',
              eipCategory: '$eipCategory', // Include the category field
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          year: '$_id',
          statusChanges: 1,
        },
      },
      {
        $sort: { year: 1 },
      },
    ]);

    const eipFinal = EipfinalStatusByYear.map(
      (item: {
        _id: { year: number; eip: string };
        lastStatus: string;
        eipTitle: string;
        eipCategory: string;
      }) => {
        return { ...item, repo: 'eip' };
      }
    );

    const ercFinal = ErcfinalStatusByYear.map(
      (item: {
        _id: { year: number; eip: string };
        lastStatus: string;
        eipTitle: string;
        eipCategory: string;
      }) => {
        return { ...item, repo: 'erc' };
      }
    );

    const ercFrozenFinal = FrozenErcData.map(
      (item: {
        _id: { year: number; eip: string };
        lastStatus: string;
        eipTitle: string;
        eipCategory: string;
      }) => {
        return { ...item, repo: 'erc' };
      }
    );

    const ripFinal = RipfinalStatusByYear.map(
      (item: {
        _id: { year: number; eip: string };
        lastStatus: string;
        eipTitle: string;
        eipCategory: string;
      }) => {
        return { ...item, repo: 'rip' };
      }
    );

    res.json({
      eip: eipFinal,
      erc: [...ercFinal, ...ercFrozenFinal],
      rip: ripFinal,
    });
  } catch (error) {
    console.log('Error:', error);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

export default handler;
