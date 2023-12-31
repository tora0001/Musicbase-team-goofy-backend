import express from "express";
import cors from "cors";
import mysql from "mysql2";
import "dotenv/config";
import fs from "fs";

const app = express();
app.use(express.json());
app.use(cors());

const port = process.env.PORT || 4000;

app.listen(port, () => console.log(`Testdata APP listening on port ${port}`));

// establish database connection

const dbconfig = {
  host: process.env.MYSQL_HOST,
  database: process.env.MYSQL_DATABASE,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
};

if (process.env.MYSQL_CERT) {
  dbconfig.ssl = { cs: fs.readFileSync("DigiCertGlobalRootCA.crt.pem") };
}

const connection = mysql.createConnection(dbconfig);

// create an album with songs and artist

app.post("/createAlbum", (request, response) => {
  const { artist, album, songs } = request.body;

  const artistQuery = "INSERT INTO artists (name, image, genre) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id)";
  connection.query(artistQuery, [artist.name, artist.image, artist.genre], (error) => {
    if (error) {
      console.error(error);
      response.status(500).json({ error: "one error occurred" });
    } else {
      const getArtistID = "SELECT id FROM artists WHERE name = ?";
      connection.query(getArtistID, [artist.name], (error, artistResults) => {
        if (error) {
          console.error(error);
          response.status(500).json({ error: "two error occurred" });
        } else {
          const albumQuery = "INSERT INTO albums (albumName, image, releaseYear) VALUES (?, ?, ?)";
          connection.query(albumQuery, [album.albumName, album.image, album.releaseYear], (error, albumResults) => {
            if (error) {
              console.error(error);
              response.status(500).json({ error: "three error occurred" });
            } else {
              // Opret hvert enkelt spor i albummet
              const songQuery = "INSERT INTO songs (songName, length) VALUES (?, ?)";
              for (const song of songs) {
                connection.query(songQuery, [song.songName, song.length], (error) => {
                  if (error) {
                    console.error(error);
                  }
                });
              }
              response.status(201).json({ message: "Album created successfully" });
            }
          });
        }
      });
    }
  });
});

// artists CRUD functions

// read / get

app.get("/artists", (request, response) => {
  const query = "SELECT * FROM artists ORDER BY name";
  connection.query(query, (error, results, fields) => {
    if (error) {
      console.log(error);
    } else {
      response.json(results);
    }
  });
});

// create / post

app.post("/artists", (request, response) => {
  const artist = request.body;
  const query = "INSERT INTO artists(name, image, genre) values(?,?,?);";
  const values = [artist.name, artist.image, artist.genre];

  connection.query(query, values, (error, results, fields) => {
    if (error) {
      console.log(error);
    } else {
      response.json(results);
    }
  });
});

// update / put

app.put("/artists/:id", (request, response) => {
  const id = request.params.id;
  const artist = request.body;
  const query = "UPDATE artists SET name=?, image=?, genre=? WHERE id=?;";
  const values = [artist.name, artist.image, artist.genre, id];

  connection.query(query, values, (error, results, fields) => {
    if (error) {
      console.log(error);
    } else {
      response.json(results);
    }
  });
});

// delete / delete

app.delete("/artists/:id", (request, response) => {
  const id = request.params.id;
  const query = "DELETE FROM artists WHERE id=?;";
  const values = [id];

  connection.query(query, values, (error, results, fields) => {
    if (error) {
      console.log(error);
    } else {
      response.json(results);
    }
  });
});

// all albums from 1 artists

app.get("/artists/:id/albums", (request, response) => {
  const id = request.params.id;

  const queryString = /*sql*/ `
    SELECT * FROM albums, artists 
    WHERE artistID=? AND
    albums.artistID = artists.id
    ORDER BY albums.albumName;`;

  const values = [id];

  connection.query(queryString, values, (error, results) => {
    if (error) {
      console.log(error);
    } else {
      response.json(results);
    }
  });
});

app.get("/artists/:id", (request, response) => {
  const id = request.params.id;

  const queryString = /*sql*/ `
    SELECT * FROM artists
    WHERE id=?;`;

  const values = [id];

  connection.query(queryString, values, (error, results) => {
    if (error) {
      console.log(error);
    } else {
      response.json(results);
    }
  });
});

// albums CRUD functions

// read / get

app.get("/albums", (request, response) => {
  const query = "SELECT * FROM albums  ORDER BY albumName";
  connection.query(query, (error, results, fields) => {
    if (error) {
      console.log(error);
    } else {
      response.json(results);
    }
  });
});

app.get("/albums/:id", (request, response) => {
  const id = request.params.id;

  const queryString = /*sql*/ `
    SELECT * FROM albums
    WHERE id=?;`;

  const values = [id];

  connection.query(queryString, values, (error, results) => {
    if (error) {
      console.log(error);
    } else {
      response.json(results);
    }
  });
});

// albums CRUD functions

// read / get

app.get("/albums", (request, response) => {
  const query = "SELECT * FROM albums  ORDER BY albumName";
  connection.query(query, (error, results, fields) => {
    if (error) {
      console.log(error);
    } else {
      response.json(results);
    }
  });
});

// create / post

app.post("/albums", (request, response) => {
  const album = request.body;
  const query = "INSERT INTO albums(albumName, image, releaseYear) values(?,?,?);";
  const values = [album.albumName, album.image, album.releaseYear];

  connection.query(query, values, (error, results, fields) => {
    if (error) {
      console.log(error);
    } else {
      response.json(results);
    }
  });
});

// update / put

app.put("/albums/:id", (request, response) => {
  const id = request.params.id;
  const album = request.body;
  const query = "UPDATE albums SET albumName=?, image=?, releaseYear=? WHERE id=?;";
  const values = [album.albumName, album.image, album.releaseYear, id];

  connection.query(query, values, (error, results, fields) => {
    if (error) {
      console.log(error);
    } else {
      response.json(results);
    }
  });
});

// delete / delete

app.delete("/albums/:id", (request, response) => {
  const id = request.params.id;
  const query = "DELETE FROM albums WHERE id=?;";
  const values = [id];

  connection.query(query, values, (error, results, fields) => {
    if (error) {
      console.log(error);
    } else {
      response.json(results);
    }
  });
});

// songs CRUD functions

// read / get

app.get("/songs", (request, response) => {
  const query = "SELECT * FROM songs ORDER BY songName";
  connection.query(query, (error, results, fields) => {
    if (error) {
      console.log(error);
    } else {
      response.json(results);
    }
  });
});

// create / post

app.post("/songs", (request, response) => {
  const song = request.body;
  const query = "INSERT INTO songs(songName, length) values(?,?);";
  const values = [song.songName, song.length];

  connection.query(query, values, (error, results, fields) => {
    if (error) {
      console.log(error);
    } else {
      response.json(results);
    }
  });
});

// update / put

app.put("/songs/:id", (request, response) => {
  const id = request.params.id;
  const song = request.body;
  const query = "UPDATE songs SET songName=?, length=? WHERE id=?;";
  const values = [song.songName, song.length, id];

  connection.query(query, values, (error, results, fields) => {
    if (error) {
      console.log(error);
    } else {
      response.json(results);
    }
  });
});

// delete / delete

app.delete("/songs/:id", (request, response) => {
  const id = request.params.id;
  const query = "DELETE FROM songs WHERE id=?;";
  const values = [id];

  connection.query(query, values, (error, results, fields) => {
    if (error) {
      console.log(error);
    } else {
      response.json(results);
    }
  });
});

// search artists

app.get("/artists/search", async (request, response) => {
  const query = request.query.q;
  const artists = await getArtists();
  const results = artists.filter((artist) => artist.name.toLowerCase().includes(query));
  response.json(results);
});

// songs with multiple artists

app.get("/songs/:id", (request, response) => {
  const id = request.params.id; // sql query to select all from the table posts
  const query = /*sql*/ `
            SELECT songs.*,
                artists.name AS artistName,
                artists.image AS artistImage,
                artists.genre AS artistGenre,
                artists.id AS artistID
            FROM songs
            INNER JOIN artists_songs
                ON songs.id = artists_songs.song_id
            INNER JOIN artists
                ON artists_songs.artist_id = artists.id
            WHERE songs.id = ?;
    `;
  const values = [id];

  connection.query(query, values, (error, results, fields) => {
    if (error) {
      console.log(error);
      response.status(500).json({ error: "error" });
    } else {
      const songs = prepareSongData(results);
      response.json(songs);
    }
  });
});

// helpers

function prepareSongData(results) {
  // Create an object to store posts with users as an array
  const songsWithArtists = {};

  for (const song of results) {
    // If the post is not in the object, add it
    if (!songsWithArtists[song.id]) {
      songsWithArtists[song.id] = {
        id: song.id,
        songName: song.songName,
        length: song.length,
        artists: [],
      };
    }

    songsWithArtists[song.id].artists.push({
      name: song.artistName,
      image: song.artistImage,
      genre: song.artistGenre,
      id: song.artistID,
    });
  }

  const songsArray = Object.values(songsWithArtists);
  return songsArray;
}
