import asyncHandler from 'express-async-handler'

import Project from '../models/project.js'


const getProjects = asyncHandler(async (req, res) => {
  
  const filter = req.query
  const {keyword, ...extrafileds} = filter
  const query = {...extrafileds}
  if(keyword) {
    query.$or = [
      {title: { $regex: keyword, $options: "i" }},
      {team: { $regex: keyword, $options: "i" }},
      {description: { $regex: keyword, $options: "i" }},
    ]
  }

  const count = await Project.countDocuments({ ...query || {} })
  const projects = await Project.find({ ...query || {}})
    .limit(0)
    .skip(0)

  res.json({ projects,count:count })
})


const getProjectById = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id)

  if (project) {
    res.json(project)
  } else {
    res.status(404)
    throw new Error('Product not found')
  }
})

const deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id)

  if (project) {
    await project.remove()
    res.json({ message: 'Product removed' })
  } else {
    res.status(404)
    throw new Error('Product not found')
  }
})


const createProject = asyncHandler(async (req, res) => {
  const product = new Product({
    title: req.body['title'],
    user: req.user.id,
    image: req.body['image'],
    linkData:req.body['linkData'],
    team: req.body['team'],
    tags: req.body.tags ? req.body.tags : [],
    fromDate: req.body['fromDate'],
    toDate: req.body['toDate'],
    numReviews: 0,
    description: req.body['description']
  })

  const createdProject = await product.save()
  res.status(201).json(createdProject)
})

const updateProject = asyncHandler(async (req, res) => {

  const project = await Project.findByIdAndUpdate(req.params.id,req.body)

  if (!project) {
    res.status(404)
    throw new Error('Product not found')
  }

  res.status(200).json(updatedProject)
})


const createProjectReview = asyncHandler(async (req, res) => {
  const { comment } = req.body

  const project = await Project.findById(req.params.id)

  if (project) {
    const alreadyCommented = project.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    )

    if (alreadyCommented) {
      res.status(400)
      throw new Error('Project already commented')
    }

    const commentData = {
      comment,
      user: req.user._id,
    }

    project.reviews.push(commentData)

    project.numReviews = project.reviews.length

    await project.save()
    res.status(201).json({ message: 'Comment added' })
  } else {
    res.status(404)
    throw new Error('Project not found')
  }
})


export {
  getProjects,
  getProjectById,
  deleteProject,
  createProject,
  updateProject,
  createProjectReview,
}