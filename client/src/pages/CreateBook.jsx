import { TextInput, Select, FileInput, Button, Spinner } from "flowbite-react";
import { useState } from "react";
import { toast } from "react-toastify";

export default function CreateBook() {
  const [file, setFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null); 
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false); 

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    data.append("bookName", formData.bookName);
    data.append("category", formData.category);
    data.append("rentPerDay", formData.rentPerDay);

    if (file) {
      data.append("cover", file);
    }

      setLoading(true);
      const res = await fetch("/api/books/create", {
        method: "POST",
        body: data,
      });
      const responseData = await res.json();
      if (!res.ok) {
        if (responseData.message.includes("duplicate key")) {
          toast.error("Book Already Exists");
          setLoading(false);
        } else {
          toast.error(responseData.message);
          setLoading(false);
        }
        return;
      }
      console.log(res);

      if (res.ok) {
        toast.success("Created Successfully");
        setLoading(false);
        setFormData({});
      }
   
  };

  return (
    <div className="p-3 max-w-3xl mx-auto min-h-screen">
      <h1 className="text-center text-3xl my-7 font-semibold mt-16">
        Create a Book
      </h1>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <TextInput
          type="text"
          placeholder="Book Name"
          required
          id="bookName"
          onChange={(e) => {
            setFormData({ ...formData, bookName: e.target.value });
          }}
        />

        <Select
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
          onChange={(e) => {
            setFormData({ ...formData, rentPerDay: e.target.value });
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
            <img
              src={imagePreview}
              alt="Image preview"
              className="h-72 object-cover mt-4"
            />
          )}
        </div>

        <Button type="submit" gradientDuoTone="pinkToOrange" disabled={loading}>
          {loading ? <Spinner aria-label="Loading" /> : "Create Book"}
        </Button>
      </form>
    </div>
  );
}
