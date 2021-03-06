const mongoose = require('mongoose');
const Store = mongoose.model('Store');
const multer = require('multer');
const jimp = require('jimp');
const uuid = require('uuid');


const multerOptions = {
    storage: multer.memoryStorage(),
    fileFilter(req, file, next) {
        const isPhoto = file.mimetype.startsWith('image/');
        if (isPhoto) {
            next(null, true);
        } else {
            next({ massage: 'That filetype isn\'t allowed!}' }, false);
        }
    }
};

exports.homePage = (req, res) => {
    res.render('index', { title: 'I Love Food!' });
};

exports.addStore = (req, res) => {
    res.render('editStore', { title: 'Edit Store' });
};

exports.upload = multer(multerOptions).single('photo');

exports.resize = async(req, res, next) => {
    if (!req.file) {
        next();
        return;
    }
    const extension = req.file.mimetype.split('/')[1];
    req.body.photo = `${uuid.v4()}.${extension}`;
    const photo = await jimp.read(req.file.buffer);
    await photo.resize(800, jimp.AUTO);
    await photo.write(`./public/uploads/${req.body.photo}`);
    next();
};

exports.createStore = async(req, res) => {
    const store = await (new Store(req.body).save());
    req.flash('success', `Successfully Created ${store.name}. Care to leave a review`);
    res.redirect(`/stores/${store.slug}`);
};
exports.getStores = async(req, res) => {
    const stores = await Store.find();
    res.render('store', { title: 'Store', stores });
};
exports.getStore = async(req, res) => {
    await Store.findOne({ _id: req.params.id }).exec((err, data) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error',
                errors: err
            });
        }
        res.render('editStore', { title: `Edit ${data.name}`, data });
    });
}

exports.getSlug = async(req, res, next) => {
    await Store.findOne({ slug: req.params.slug }).exec((err, store) => {

        if (!store) return next();
        res.render('storeg', { store, title: store.name });
    });
}

exports.updateStore = async(req, res) => {
    const store = await Store.findOneAndUpdate({ _id: req.params.id }, req.body, {
        new: true,
        runValidators: true
    }).exec();
    req.flash('success', `Successfully updated <strong>${store.name}</strong>.
    <a href="/stores/${store.slug}">View Store -> </a>`);
    res.redirect(`/stores/${store._id}/edit`);
};

exports.getTag = async(req, res) => {
    const tag = req.params.id;
    const Promisetags = Store.getTagsList();
    const tagQuery = tag || { $exits: true };
    const PromiseStore = Store.find({ tags: tagQuery });
    const [tags, stores] = await Promise.all([Promisetags, PromiseStore]);

    res.render('tags', { tags, title: 'Tags', tag, stores })
};