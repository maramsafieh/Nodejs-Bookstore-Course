const express = require("express");
const router = express.Router();
const asynchandler = require("express-async-handler");
const { Author, validateUpdateAuthor, validateCreateAuthor } = require("../models/Author");
const { verifyTokenAndAdmin } = require("../middlewares/verifyToken"); // استيراد ميدل وير الحماية

/**
 * @desc    Get all authors
 * @route   /api/authors
 * @method  GET
 * @access  public
 */
router.get("/", asynchandler(
    async (req, res) => {
        const authorList = await Author.find();
        res.status(200).json(authorList);
    }
));

/**
 * @desc    Get author by id 
 * @route   /api/authors/:id
 * @method  GET
 * @access  public
 */
router.get("/:id", asynchandler(
    async (req, res) => {
        const author = await Author.findById(req.params.id);
        if (author) {
            res.status(200).json(author);
        } else {
            res.status(404).json({ message: "author not found" });
        }
    }
));

/**
 * @desc    CREATE NEW AUTHOR
 * @route   /api/authors
 * @method  POST
 * @access  private (only admin)
 */
router.post(
    "/", 
    verifyTokenAndAdmin, // حماية المسار [Screenshot 2026-05-01 185605.jpg]
    asynchandler(
        async (req, res) => {
            const { error } = validateCreateAuthor(req.body);
            if (error) {
                return res.status(400).json({ message: error.details[0].message });
            }
            
            const author = new Author({
                firstName: req.body.firstName, // تأكدي من مطابقة الأسماء للـ Model
                lastName: req.body.lastName,
                nationality: req.body.nationality,
                image: req.body.image
            });
            
            const result = await author.save();
            res.status(201).json(result);
        }
    )
);

/**
 * @desc    Update a author
 * @route   /api/authors/:id
 * @method  PUT
 * @access  private (only admin)
 */
router.put(
    "/:id", 
    verifyTokenAndAdmin, // إضافة الحماية هنا أيضاً
    asynchandler(
        async (req, res) => {
            const { error } = validateUpdateAuthor(req.body);
            if (error) {
                return res.status(400).json({ message: error.details[0].message });
            }
            
            const author = await Author.findByIdAndUpdate(req.params.id, {
                $set: {
                    firstName: req.body.firstName,
                    lastName: req.body.lastName,
                    nationality: req.body.nationality,
                    image: req.body.image
                }
            }, { new: true });
    
            if (author) {
                res.status(200).json(author);
            } else {
                res.status(404).json({ message: "author not found" });
            }
        }
    )
);

/**
 * @desc    Delete a author
 * @route   /api/authors/:id
 * @method  DELETE
 * @access  private (only admin)
 */
router.delete(
    "/:id", 
    verifyTokenAndAdmin, // حماية المسار [Screenshot 2026-05-01 185633.jpg]
    asynchandler(
        async (req, res) => {
            const author = await Author.findById(req.params.id);
            if (author) {
                await Author.findByIdAndDelete(req.params.id);
                res.status(200).json({ message: "author has been deleted" });
            } else {
                res.status(404).json({ message: "author not found" });
            }
        } 
    )
);

module.exports = router;