import { useEffect, useRef, useState } from 'react';
import api, { isAuthenticated } from '../api';

const categories = ['Cycles', 'Books', 'Electronics', 'Accessories', 'Furniture', 'Sports', 'Other'];

export default function ListingForm({ onSubmitted }) {
  const [submitting, setSubmitting] = useState(false);
  const [formMessage, setFormMessage] = useState('');
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [imageError, setImageError] = useState('');
  const imageInputRef = useRef(null);

  useEffect(() => {
    if (!selectedImages.length) {
      setImagePreviews([]);
      return undefined;
    }

    const previewUrls = selectedImages.map((file) => URL.createObjectURL(file));
    setImagePreviews(previewUrls);
    return () => previewUrls.forEach((url) => URL.revokeObjectURL(url));
  }, [selectedImages]);

  function handleImageChange(event) {
    const files = Array.from(event.target.files || []);
    setImageError('');
    setFormMessage('');

    if (!files.length) return;
    if (files.some((file) => !file.type.startsWith('image/'))) {
      setSelectedImages([]);
      setImageError('Please choose a valid image file.');
      event.target.value = '';
      return;
    }
    if (files.some((file) => file.size > 5 * 1024 * 1024)) {
      setSelectedImages([]);
      setImageError('Each image must be 5 MB or smaller.');
      event.target.value = '';
      return;
    }
    setSelectedImages(files);
    if (files.length < 2) setImageError('Choose at least two images for a listing.');
  }

  function removeSelectedImage() {
    setSelectedImages([]);
    setImageError('');
    if (imageInputRef.current) imageInputRef.current.value = '';
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    setFormMessage('');
    setImageError('');

    try {
      const form = event.currentTarget;
      const formData = new FormData(form);
      const title = String(formData.get('title') || '').trim();
      const category = String(formData.get('category') || 'books').toLowerCase();
      const condition = String(formData.get('condition') || 'good').toLowerCase();
      const price = Number(formData.get('price'));
      const pickupPoint = String(formData.get('pickupPoint') || '').trim();
      const description = String(formData.get('description') || '').trim();

      if (!title || !pickupPoint || !description || !Number.isFinite(price) || price < 0 || !isAuthenticated()) {
        setFormMessage(
          isAuthenticated()
            ? 'Please enter all required details and a valid price.'
            : 'Please log in before publishing a listing.'
        );
        return;
      }
      if (selectedImages.length < 2) {
        setImageError('Choose at least two images for a listing.');
        return;
      }

      formData.set('category', category);
      formData.set('condition', condition);
      await api.post('/listings', formData);
      form.reset();
      setSelectedImages([]);
      if (imageInputRef.current) imageInputRef.current.value = '';
      setFormMessage('Your listing has been submitted for admin review.');
      onSubmitted?.();
    } catch (error) {
      setFormMessage(error.response?.data?.message || 'Could not submit the listing.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="listing-form-section" aria-labelledby="form-title">
      <h2 id="form-title">Give your item a new home</h2>
      <p className="form-note">Add your item below. Listings are submitted for admin review.</p>

      <form className="listing-form" onSubmit={handleSubmit}>
        <label>
          Item name
          <input required name="title" maxLength={100} placeholder="e.g. Engineering textbook" />
        </label>

        <label>
          Category
          <select name="category" defaultValue="Books">
            {categories.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>

        <label>
          Condition
          <select name="condition" defaultValue="good">
            <option value="new">New</option>
            <option value="like-new">Like new</option>
            <option value="good">Good</option>
            <option value="fair">Fair</option>
            <option value="poor">Poor</option>
          </select>
        </label>

        <label>
          Price ({'\u20B9'})
          <input required name="price" type="number" min="0" max="1000000" step="1" placeholder="e.g. 250" />
        </label>

        <label>
          Pickup point
          <input required name="pickupPoint" maxLength={100} placeholder="e.g. Library entrance" />
        </label>

        <label className="form-wide">
          Description
          <textarea required name="description" rows="3" maxLength={1000} placeholder="Describe the condition and details..." />
        </label>

        <div className="form-wide image-upload-field">
          <label htmlFor="item-image" className="upload-heading">
            Product photos <span>(at least 2 required)</span>
          </label>
          <label htmlFor="item-image" className="image-upload-box">
            <span className="upload-icon">{'\u{1F4F8}'}</span>
            <strong>{selectedImages.length ? `${selectedImages.length} photos selected` : 'Click to upload photos'}</strong>
            <span>JPG, PNG, WEBP {'\u00B7'} Maximum 5 MB each</span>
            <input
              ref={imageInputRef}
              id="item-image"
              name="images"
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="image-file-input"
            />
          </label>

          {imageError && <p className="image-error" role="alert">{imageError}</p>}

          {imagePreviews.length > 0 && (
            <div className="image-preview">
              {imagePreviews.map((preview, index) => (
                <img key={preview} src={preview} alt={`Selected product photo ${index + 1}`} />
              ))}
              <button type="button" className="remove-image-button" onClick={removeSelectedImage}>
                {'\u2715'} Remove photos
              </button>
            </div>
          )}
        </div>

        <button className="primary-button" type="submit" disabled={submitting}>
          {submitting ? 'Saving item...' : '\u002B Publish listing'}
        </button>
      </form>

      {formMessage && <p className="form-message" role="status">{formMessage}</p>}
    </section>
  );
}
