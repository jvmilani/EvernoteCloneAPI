const express = require('express');
const router = express.Router();
const Note = require('../models/notes');
const WithAuth = require('../middlewares/auth');
const req = require('express/lib/request');

router.post('/create', WithAuth, async(req, res) => {
    const { title, body } = req.body;
    
    try {
        let note = new Note({ title: title, body: body, userID: req.user._id});
        await note.save();
        res.status(200).json(note);
    } catch (error) {
        res.status(500).json({error: 'Problem to create a new note'})
    }
})

router.get('/', WithAuth, async (req,res) => {
    try {
        let notesList = await Note.find({userID: req.user._id})
        res.status(200).json(notesList)
    } catch (error) {
        res.status(500).json(error)
    }
})

router.get('/search', WithAuth, async(req, res) => {
    const { query } = req.query;
    
    try {
        console.log(req.user._id);
        let notes = await Note.find({ userID: req.user._id}).find({$title: {$search: query}})
        res.json(notes)
    } catch (error) {
        res.json({error: error}).status(500)
    }
})

router.get('/:id', WithAuth, async(req, res) => {
    try {
        const { id } = req.params;
        let note = await Note.findById(id);
        if(isOwner(req.user, note))
            res.json(note);
        else
            res.status(403).json({error: 'Permission denied'}) 
    } catch (error) {
        res.status(500).json({error: 'Not get a note'})
    }
})

router.put('/:id', WithAuth, async(req, res) => {
    const { title, body } = req.body;
    const { id } = req.params;
    try {
        let updateNote = await Note.findById(id)
        if(isOwner(req.user, updateNote)){
            console.log(req.user);
            let updatedNote = await Note.findOneAndUpdate(id, 
                { $set: {title: title, body: body} },
                {upsert: true,'new': true})
        res.status(200).json(updatedNote)
            }else{
                res.status(403).json({ error: "Unauthorized" });

            }

    } catch (error) {
        res.status(500).json(error);
        
    }
})


router.delete("/:id", WithAuth, async (req, res) => {

  const { id } = req.params;
  try {
    let deleteNote = await Note.findById(id);
    if (isOwner(req.user, deleteNote)) {
      await deleteNote.delete();
      res.json({ message: "Deletado com sucesso" }).status(204);
    } else {
      res.status(403).json({ error: "Unauthorized" });
    }
  } catch (error) {
    res.status(500).json(error);
  }
});


const isOwner = (user, note) => {
    if(JSON.stringify(user._id) == JSON.stringify(note.userID._id))
        return true;
}

module.exports = router;