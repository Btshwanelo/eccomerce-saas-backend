const mongoose = require('mongoose');

const CollaboratorSchema = new mongoose.Schema({
  department: String,
  votes: {
    type: Number,
    default: 0
  }
});

const VersionSchema = new mongoose.Schema({
  number: String,
  date: String,
  changes: String
});

const ClarifyingQuestionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true
  },
  answer: String
});

const TrendApplicationSchema = new mongoose.Schema({
  trend: String,
  application: String
});

const StakeholderEvaluationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  role: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    min: 0,
    max: 10
  },
  feedback: String,
  concerns: [String],
  opportunities: [String],
  avatar: String
});


const PositionSchema = new mongoose.Schema({
  x: {
    type: Number,
    required: [true, 'X coordinate is required']
  },
  y: {
    type: Number,
    required: [true, 'Y coordinate is required']
  }
});

const PrioritizationSchema = new mongoose.Schema({
  quadrant: {
    type: String,
    enum: ['q1', 'q2', 'q3', 'q4','none'],
    required: [true, 'Quadrant is required'],
    default: 'none'
  },
  position: {
    type: PositionSchema,
    required: [true, 'Position coordinates are required']
  }
});

const IdeaSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  status: {
    type: String,
    enum: ['Accepted', 'Rejected', 'Unknown'],
    default: 'Unknown'
  },
  solutionType: {
    type: String,
    enum: [
      "technology",
      "process",
      "strategy",
      "flowchart",
      "checklist",
      "document"
    ],
    default: null
  },
  group: {
    type: String,
    trim: true
  },
  isAiGenerated: {
    type: Boolean,
    default: false
  },
  methodology: {
    type: String,
    trim: true
  },
  timeline: {
    type: String,
    enum: ['near term', 'mid term', 'long term','none'],
    default: 'none'
  },
  category: String,
  prioritization: {
    type: PrioritizationSchema,
    default:{quadrant:'none',position:{x:0,y:0}},
  },
  impact: {
    type: Number,
    min: 0,
    max: 10
  },
  creativity:{type:String, default:''},
  feasibility: {
    type: Number,
    min: 0,
    max: 10
  },
  pros: [String],
  cons: [String],
  requiredResources: [String],
  collaborators: [CollaboratorSchema],
  version: [VersionSchema],
  clarifyingQuestions: [ClarifyingQuestionSchema],
  trendApplications: [TrendApplicationSchema],
  stakeholderEvaluations: [StakeholderEvaluationSchema],
  projectId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Project',
            required: [true, 'Project ID is required']
          },
  needId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'NeedStatement',
            required: [true, 'NeedStatement ID is required']
          },
  personaId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'IdeationPersona',
            required: [true, 'IdeationPersona ID is required']
          },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Idea', IdeaSchema);