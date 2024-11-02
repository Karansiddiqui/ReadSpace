import {
  TextInput,
  Select,
  FileInput,
  Button,
  Spinner,
  Textarea,
} from "flowbite-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function CreateBook() {
  const [file, setFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const navigate = useNavigate();

  // Fetch book details if bookId exists
  const params = new URLSearchParams(window.location.search);
  const bookId = params.get("bookId");
  useEffect(() => {
    if (bookId) {
      setIsEditMode(true);
      fetch(`/api/books/getBookById/${bookId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data) {
            setFormData(data.data);
            console.log(data.data);

            setImagePreview(data.data.cover); // Assuming cover is a URL
          }
        })
        .catch((error) => {
          toast.error("Failed to fetch book details");
        });
    }
  }, []);

  const handleImageChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
      setFormData({ ...formData, cover: selectedFile });
    }
  };

  const handleRemoveImage = () => {
    setFile(null);
    setImagePreview(null);
    setFormData({ ...formData, cover: null });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(formData);

    const data = new FormData();
    data.append("bookName", formData.bookName);
    data.append("category", formData.category);
    data.append("author", formData.author);
    data.append("description", formData.description);
    data.append("rentPerDay", formData.rentPerDay);
    data.append("oneTimePrice", formData.oneTimePrice);
    data.append("publicationYear", formData.publicationYear);
    data.append("topic", formData.topic);

    if (file) {
      data.append("cover", file);
    } else {
      // console.log("cover");
      data.append("cover", formData.cover);
    }

    setLoading(true);
    const url = isEditMode
      ? `/api/books/update/${bookId}`
      : "/api/books/create";

    const res = await fetch(url, {
      method: isEditMode ? "PUT" : "POST",
      body: data,
    });

    const responseData = await res.json();
    if (!res.ok) {
      if (responseData.message.includes("duplicate key")) {
        toast.error("Book Already Exists");
      } else {
        toast.error(responseData.message);
      }
      setLoading(false);
      return;
    }

    if (res.ok) {
      toast.success(
        isEditMode ? "Updated Successfully" : "Created Successfully"
      );
      setLoading(false);
      setFormData({});
      setImagePreview(null);
    }
  };

  return (
    <div className="p-3 max-w-3xl mx-auto min-h-screen">
      <h1 className="text-center text-3xl my-7 font-semibold mt-16">
        {isEditMode ? "Update Book" : "Create a Book"}
      </h1>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <TextInput
          type="text"
          placeholder="Book Name"
          required
          id="bookName"
          value={formData.bookName || ""}
          onChange={(e) => {
            setFormData({ ...formData, bookName: e.target.value });
          }}
        />

        <TextInput
          type="text"
          placeholder="Author"
          required
          id="author"
          value={formData.author || ""}
          onChange={(e) => {
            setFormData({ ...formData, author: e.target.value });
          }}
        />

        <Textarea
          placeholder="Description"
          required
          id="description"
          rows={4}
          value={formData.description || ""}
          onChange={(e) => {
            setFormData({ ...formData, description: e.target.value });
          }}
        />

        <TextInput
          type="number"
          placeholder="Publication Year"
          required
          id="publicationYear"
          value={formData.publicationYear || ""}
          onChange={(e) => {
            setFormData({ ...formData, publicationYear: e.target.value });
          }}
        />

        <TextInput
          type="text"
          placeholder="Topic"
          required
          id="topic"
          value={formData.topic || ""}
          onChange={(e) => {
            setFormData({ ...formData, topic: e.target.value });
          }}
        />

        <Select
          value={formData.category || ""}
          onChange={(e) => {
            setFormData({ ...formData, category: e.target.value });
          }}
          required
        >
          <option value="">Select a Category</option>
          <option value="fiction">Fiction</option>
          <option value="non-fiction">Non-Fiction</option>
          <option value="science">Science</option>
        </Select>

        <TextInput
          type="number"
          placeholder="Rent Per Day in Rs."
          required
          id="rentPerDay"
          value={formData.rentPerDay || ""}
          onChange={(e) => {
            setFormData({ ...formData, rentPerDay: e.target.value });
          }}
        />

        <TextInput
          type="number"
          placeholder="One time Price"
          id="oneTimePrice"
          value={formData.oneTimePrice || ""}
          onChange={(e) => {
            setFormData({ ...formData, oneTimePrice: e.target.value });
          }}
        />

        <div className="flex gap-4 items-center justify-center border-4 border-teal-500 border-dotted p-3">
          {!imagePreview ? (
            <FileInput
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />
          ) : (
            <div className="flex flex-col items-center">
              <img
                src={imagePreview}
                alt="Image preview"
                className="h-72 object-cover mt-4"
              />
              <Button
                color="failure"
                onClick={handleRemoveImage}
                className="mt-3"
              >
                Reupload Image
              </Button>
            </div>
          )}
        </div>

          <Button
            type="submit"
            gradientDuoTone="pinkToOrange"
            disabled={loading}
          >
            {loading ? (
              <Spinner aria-label="Loading" />
            ) : isEditMode ? (
              "Update Book"
            ) : (
              "Create Book"
            )}
          </Button>
      </form>
    </div>
  );
}
