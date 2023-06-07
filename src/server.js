const Hapi = require("@hapi/hapi");
const fs = require("fs");

const dataFilePath = "data.json";
let books = [];

const loadData = () => {
  try {
    const rawData = fs.readFileSync(dataFilePath);
    books = JSON.parse(rawData);
  } catch (error) {
    console.error("Failed to load data:", error);
  }
};

const saveData = () => {
  try {
    const data = JSON.stringify(books, null, 2);
    fs.writeFileSync(dataFilePath, data);
  } catch (error) {
    console.error("Failed to save data:", error);
  }
};

const init = async () => {
  const server = Hapi.server({
    port: 9000,
    host: "localhost",
  });


// untuk melihat semua data yang tersimpan
  server.route({
    method: "GET",
    path: "/books",
    handler: (request, h) => {
      return h.response({ success: true, data: books });
    },
  });


// untuk menambahkan buku
  server.route({
    method: "POST",
    path: "/books",
    handler: (request, h) => {
      const { title, author, tahun, penerbit } = request.payload;
      const id = books.length + 1;
      const newBook = {
        id,
        title,
        author,
        tahun,
        penerbit
      };
      books.push(newBook);

      saveData();

      return h.response({ success: true, data: newBook }).code(201);
    },
  });


// untuk menghapus buku dengan method DELETE
  server.route({
    method: "DELETE",
    path: "/books/{id}",
    handler: (request, h) => {
      const { id } = request.params;
      const index = books.findIndex((book) => book.id == id);

      if (index !== -1) {
        saveData();
        return h.response({ success: true, message: "DATA BERHASIL DI HAPUS" }).code(200);
      } else {
        return h
          .response({ success: false, message: "Book not found" })
          .code(404);
      }
    },
  });


// untuk mencari buku dengan ID
  server.route({
    method: "GET",
    path: "/books/{id}",
    handler: (request, h) => {
      const { id } = request.params;
      const book = books.find((book) => book.id == id);

      if (book) {
        return h.response({ success: true, data: book }).code(200);
      } else {
        return h.response({ success: false, message: "Book not found" }).code(404);
      }
    },
  });

// untuk mengedit data buku dengan method PUT
  server.route({
    method: "PUT",
    path: "/books/{id}",
    handler: (request, h) => {
      const { id } = request.params;
      const { title, author, tahun, penerbit } = request.payload;

      const index = books.findIndex((book) => book.id == id);

      if (index !== -1) {
        books[index].title = title;
        books[index].author = author;
        books[index].tahun = tahun;
        books[index].penerbit = penerbit;
        saveData();
        return h.response({ success: true, message: "Book updated successfully" }).code(200);
      } else {
        return h.response({ success: false, message: "Book not found" }).code(404);
      }
    },
  });


  loadData();

  await server.start();
  console.log("Server running on %s", server.info.uri);
};

init().catch((err) => {
  console.error(err);
  process.exit(1);
});
