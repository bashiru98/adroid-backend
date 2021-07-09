import mongoose from 'mongoose'

const reviewSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    comment: { type: String, required: true },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
)

const projectSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    title: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: [true, "image is required"],
    },
    fromDate: {
      type: String
    },
    toDate: {
      type: String,
      default:"present"
    },
    description: {
      type: String,
      required: true,
    },
    reviews: [reviewSchema],
    tags: [String],
    team: {
      type: String,
      default:"Xlent Developers"
    },

    linkData: {
      linkTitle: String,
      link:String
    },
  },
  
  {
    timestamps: true,
  }
)

const Project = mongoose.model('Product', projectSchema)

export default Project