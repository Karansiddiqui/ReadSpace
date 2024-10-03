export default function About() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-2xl mx-auto p-3 text-center">
        <div className="text-md dark:text-gray-500 flex flex-col gap-6">
          <div className="container mx-auto p-8">
            <h1 className="text-3xl font-bold mb-4 text-center">
              About the Book Rental Management System
            </h1>
            <p className="text-lg leading-relaxed mb-4">
              The Book Rental Management System is an innovative platform
              designed to streamline the process of renting and managing books.
              Catering to book enthusiasts, educational institutions, and
              libraries, it offers a user-friendly interface that simplifies
              book transactions.
            </p>
            <p className="text-lg leading-relaxed mb-4">
              Users can easily register, manage their profiles, and browse a
              diverse catalog of books categorized into three main genres:
              Fiction, Non-Fiction, and Science. The system allows for efficient
              transaction tracking, enabling users to monitor rented books,
              issue dates, and return statuses.
            </p>
            <p className="text-lg leading-relaxed mb-4">
              Additionally, administrators benefit from a comprehensive
              dashboard that provides powerful tools for managing users, books,
              and generating insightful reports. With features such as custom
              date range queries for transaction filtering, this project aims to
              promote a love for reading and facilitate knowledge sharing within
              the community, all built on the robust MERN stack.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
