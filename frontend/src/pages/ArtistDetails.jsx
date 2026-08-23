import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  useNavigate,
  useParams,
} from 'react-router-dom';

import {
  ArrowLeft,
  Music2,
  Play,
  Pause,
  Heart,
  Diamond,
  ListMusic,
} from 'lucide-react';

import api from '../api/axiosInstance';
import { usePlayer } from '../context/PlayerContext';


export default function ArtistDetails() {

  const { id } = useParams();

  const navigate = useNavigate();

  /* ============================================================
     PLAYER
  ============================================================ */

  const {
    currentSong,
    isPlaying,
    playSong,
    togglePlay,
  } = usePlayer();


  /* ============================================================
     STATE
  ============================================================ */

  const [songs, setSongs] = useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');


  /* ============================================================
     FETCH SONGS
  ============================================================ */

  useEffect(() => {

    const fetchSongs = async () => {

      try {

        setLoading(true);

        setError('');

        const response =
          await api.get('/songs', {
            params: {
              limit: 100,
              offset: 0,
            },
          });


        const allSongs =
          response.data?.songs || [];


        setSongs(allSongs);

      } catch (err) {

        console.error(
          'Failed to fetch artist songs:',
          err
        );

        setError(
          err.response?.data?.message ||
          'Unable to load artist'
        );

      } finally {

        setLoading(false);

      }

    };


    fetchSongs();

  }, []);


  /* ============================================================
     FILTER ARTIST SONGS
  ============================================================ */

  const artistSongs = useMemo(() => {

    return songs.filter((song) => {

      /*
       * Primary artist relationship.
       */

      if (
        String(song.artist_id) ===
        String(id)
      ) {
        return true;
      }


      /*
       * Some backend responses may contain
       * artist_ids for multiple artists.
       */

      if (
        Array.isArray(song.artist_ids)
      ) {

        return song.artist_ids.some(
          (artistId) =>
            String(artistId) ===
            String(id)
        );

      }


      return false;

    });

  }, [songs, id]);


  /* ============================================================
     ARTIST INFORMATION
  ============================================================ */

  const artist =
    artistSongs[0];


  const artistName =
    artist?.artist_name ||
    artist?.artist ||
    'Unknown Artist';


  const artistImage =
    artist?.artist_image_url ||
    artist?.thumbnail_url ||
    null;


  /* ============================================================
     PREMIUM ARTIST
  ============================================================ */

  const isPremiumArtist =
    Boolean(
      artist?.is_premium_artist ||
      artist?.artist_is_premium ||
      artist?.is_premium ||
      artist?.premium_artist
    );


  /* ============================================================
     CURRENT SONG
  ============================================================ */

  const isCurrentSong =
    (song) =>
      currentSong &&
      String(currentSong.id) ===
        String(song.id);


  /* ============================================================
     PLAY SINGLE SONG
  ============================================================ */

  const handlePlay = (song) => {

    if (!song) {
      return;
    }


    /*
     * If the selected song is already
     * playing, toggle play/pause.
     */

    if (
      isCurrentSong(song)
    ) {

      togglePlay();

      return;
    }


    /*
     * Give PlayerContext the complete
     * artist song list as the queue.
     *
     * This means:
     *
     * Song 1
     *   ↓
     * Song 2
     *   ↓
     * Song 3
     *   ↓
     * ...
     */

    playSong(
      song,
      artistSongs
    );

  };


  /* ============================================================
     PLAY ALL ARTIST SONGS
  ============================================================ */

  const handlePlayAll = () => {

    if (
      !artistSongs.length
    ) {
      return;
    }


    /*
     * If one of this artist's songs
     * is already the current song,
     * simply resume/toggle playback.
     */

    if (
      currentSong &&
      artistSongs.some(
        (song) =>
          String(song.id) ===
          String(currentSong.id)
      )
    ) {

      togglePlay();

      return;
    }


    /*
     * Start from first artist song
     * and use ALL artist songs as queue.
     */

    playSong(
      artistSongs[0],
      artistSongs
    );

  };


  /* ============================================================
     ARTIST PLAYING STATE
  ============================================================ */

  const isArtistPlaying =
    currentSong &&
    artistSongs.some(
      (song) =>
        String(song.id) ===
        String(currentSong.id)
    ) &&
    isPlaying;


  /* ============================================================
     LOADING
  ============================================================ */

  if (loading) {

    return (

      <div className="min-h-[70vh] px-4 py-10">

        <div className="mx-auto max-w-5xl">

          <div className="h-8 w-24 animate-pulse rounded bg-slate-800" />


          <div className="mt-10 flex flex-col items-center gap-6 sm:flex-row sm:items-end">

            <div className="h-44 w-44 animate-pulse rounded-full bg-slate-800" />

            <div className="space-y-3">

              <div className="h-8 w-52 animate-pulse rounded bg-slate-800" />

              <div className="h-4 w-32 animate-pulse rounded bg-slate-900" />

            </div>

          </div>

        </div>

      </div>

    );

  }


  /* ============================================================
     ERROR / NOT FOUND
  ============================================================ */

  if (
    error ||
    !artist
  ) {

    return (

      <div className="min-h-[70vh] px-4 py-10">

        <div className="mx-auto max-w-5xl">

          <button
            onClick={() =>
              navigate('/artists')
            }
            className="
              flex
              items-center
              gap-2
              text-xs
              font-semibold
              text-slate-500
              transition
              hover:text-white
            "
          >

            <ArrowLeft className="h-4 w-4" />

            Back to Artists

          </button>


          <div
            className="
              mt-10
              rounded-2xl
              border
              border-slate-800
              bg-slate-900/40
              p-12
              text-center
            "
          >

            <Music2
              className="
                mx-auto
                h-10
                w-10
                text-slate-600
              "
            />


            <h2
              className="
                mt-4
                text-lg
                font-bold
                text-white
              "
            >
              Artist not found
            </h2>

          </div>

        </div>

      </div>

    );

  }


  /* ============================================================
     MAIN
  ============================================================ */

  return (

    <div
      className="
        relative
        min-h-[70vh]
        overflow-hidden
      "
    >

      {/* ======================================================
          BACKGROUND
      ======================================================= */}

      <div
        className="
          pointer-events-none
          absolute
          inset-x-0
          top-0
          h-96
          bg-gradient-to-b
          from-emerald-500/[0.06]
          via-transparent
          to-transparent
        "
      />


      <div
        className="
          relative
          mx-auto
          max-w-5xl
          px-4
          py-8
          sm:px-6
          lg:px-8
        "
      >

        {/* ====================================================
            BACK BUTTON
        ===================================================== */}

        <button
          onClick={() =>
            navigate('/artists')
          }
          className="
            flex
            items-center
            gap-2
            text-xs
            font-semibold
            text-slate-500
            transition
            hover:text-white
          "
        >

          <ArrowLeft className="h-4 w-4" />

          Back to Artists

        </button>


        {/* ====================================================
            ARTIST HERO
        ===================================================== */}

        <section
          className="
            mt-8
            overflow-hidden
            rounded-3xl
            border
            border-slate-800/70
            bg-slate-900/50
            p-6
            sm:p-8
          "
        >

          <div
            className="
              flex
              flex-col
              items-center
              gap-6
              sm:flex-row
              sm:items-end
              sm:justify-between
            "
          >

            {/* LEFT SIDE */}

            <div
              className="
                flex
                flex-col
                items-center
                gap-6
                sm:flex-row
                sm:items-end
              "
            >

              {/* ==================================================
                  ARTIST IMAGE
              =================================================== */}

              <div
                className="
                  relative
                  h-44
                  w-44
                  shrink-0
                "
              >

                <div
                  className="
                    absolute
                    inset-0
                    rounded-full
                    bg-emerald-500/20
                    blur-2xl
                  "
                />


                <div
                  className="
                    relative
                    h-full
                    w-full
                    overflow-hidden
                    rounded-full
                    border
                    border-emerald-400/20
                    bg-slate-900
                  "
                >

                  {artistImage ? (

                    <img
                      src={artistImage}
                      alt={artistName}
                      className="
                        h-full
                        w-full
                        object-cover
                      "
                    />

                  ) : (

                    <div
                      className="
                        flex
                        h-full
                        w-full
                        items-center
                        justify-center
                        bg-emerald-500/10
                      "
                    >

                      <Music2
                        className="
                          h-14
                          w-14
                          text-emerald-400
                        "
                      />

                    </div>

                  )}

                </div>


                {/* PREMIUM DIAMOND */}

                {isPremiumArtist && (

                  <div
                    className="
                      absolute
                      bottom-1
                      right-1
                      flex
                      h-10
                      w-10
                      rotate-45
                      items-center
                      justify-center
                      rounded-xl
                      border
                      border-amber-300/40
                      bg-gradient-to-br
                      from-amber-300
                      via-yellow-400
                      to-orange-500
                      shadow-lg
                      shadow-amber-500/30
                    "
                    title="Premium Artist"
                  >

                    <Diamond
                      className="
                        h-5
                        w-5
                        -rotate-45
                        fill-white
                        text-white
                      "
                    />

                  </div>

                )}

              </div>


              {/* ==================================================
                  ARTIST INFO
              =================================================== */}

              <div
                className="
                  min-w-0
                  text-center
                  sm:text-left
                "
              >

                <div
                  className="
                    flex
                    items-center
                    justify-center
                    gap-2
                    sm:justify-start
                  "
                >

                  <p
                    className="
                      text-[10px]
                      font-bold
                      uppercase
                      tracking-[0.2em]
                      text-emerald-400
                    "
                  >
                    Artist
                  </p>


                  {isPremiumArtist && (

                    <span
                      className="
                        inline-flex
                        items-center
                        gap-1
                        rounded-full
                        border
                        border-amber-400/20
                        bg-amber-400/10
                        px-2
                        py-1
                        text-[8px]
                        font-black
                        uppercase
                        tracking-wider
                        text-amber-300
                      "
                    >

                      <Diamond
                        className="
                          h-2.5
                          w-2.5
                          fill-amber-300
                        "
                      />

                      Premium

                    </span>

                  )}

                </div>


                <h1
                  className="
                    mt-2
                    text-3xl
                    font-black
                    tracking-tight
                    text-white
                    sm:text-4xl
                  "
                >
                  {artistName}
                </h1>


                <p
                  className="
                    mt-2
                    text-xs
                    text-slate-500
                  "
                >
                  {artistSongs.length}{' '}

                  {artistSongs.length === 1
                    ? 'song'
                    : 'songs'}

                  {' '}on Fackify
                </p>

              </div>

            </div>


            {/* ==================================================
                PLAY ALL BUTTON
            =================================================== */}

            <button
              type="button"
              onClick={handlePlayAll}
              disabled={!artistSongs.length}
              className="
                flex
                shrink-0
                items-center
                gap-2
                rounded-xl
                bg-emerald-400
                px-5
                py-3
                text-xs
                font-black
                text-slate-950
                shadow-lg
                shadow-emerald-500/10
                transition
                hover:bg-emerald-300
                active:scale-95
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >

              {isArtistPlaying ? (

                <Pause
                  className="
                    h-4
                    w-4
                    fill-current
                  "
                />

              ) : (

                <Play
                  className="
                    h-4
                    w-4
                    fill-current
                  "
                />

              )}

              {isArtistPlaying
                ? 'Pause'
                : 'Play All'}

            </button>

          </div>

        </section>


        {/* ====================================================
            SONGS HEADER
        ===================================================== */}

        <section className="mt-8">

          <div
            className="
              mb-4
              flex
              items-center
              justify-between
              gap-4
            "
          >

            <div>

              <h2
                className="
                  text-lg
                  font-black
                  text-white
                "
              >
                Songs
              </h2>


              <p
                className="
                  mt-1
                  text-xs
                  text-slate-600
                "
              >
                Music by {artistName}
              </p>

            </div>


            <div
              className="
                hidden
                items-center
                gap-2
                text-[10px]
                font-semibold
                uppercase
                tracking-wider
                text-slate-600
                sm:flex
              "
            >

              <ListMusic className="h-3.5 w-3.5" />

              {artistSongs.length} tracks

            </div>

          </div>


          {/* ====================================================
              SONG LIST
          ===================================================== */}

          <div className="space-y-2">

            {artistSongs.map(
              (song, index) => {

                const active =
                  isCurrentSong(song);

                return (

                  <div
                    key={song.id}
                    className={`
                      group
                      flex
                      items-center
                      gap-3
                      rounded-2xl
                      border
                      p-3
                      transition
                      ${
                        active
                          ? `
                            border-emerald-400/20
                            bg-emerald-400/[0.06]
                          `
                          : `
                            border-transparent
                            bg-slate-900/40
                            hover:border-slate-800
                            hover:bg-slate-900
                          `
                      }
                    `}
                  >

                    {/* ==================================================
                        NUMBER / PLAY
                    =================================================== */}

                    <div
                      className="
                        w-6
                        shrink-0
                        text-center
                        text-xs
                        text-slate-600
                      "
                    >

                      {active ? (

                        <button
                          type="button"
                          onClick={() =>
                            handlePlay(song)
                          }
                          className="
                            mx-auto
                            flex
                            h-6
                            w-6
                            items-center
                            justify-center
                            rounded-full
                            bg-emerald-400
                            text-slate-950
                            transition
                            hover:bg-emerald-300
                          "
                          title={
                            isPlaying
                              ? 'Pause'
                              : 'Play'
                          }
                        >

                          {isPlaying ? (

                            <Pause
                              className="
                                h-3
                                w-3
                                fill-current
                              "
                            />

                          ) : (

                            <Play
                              className="
                                h-3
                                w-3
                                fill-current
                              "
                            />

                          )}

                        </button>

                      ) : (

                        <>

                          <span
                            className="
                              group-hover:hidden
                            "
                          >
                            {index + 1}
                          </span>


                          <button
                            type="button"
                            onClick={() =>
                              handlePlay(song)
                            }
                            className="
                              mx-auto
                              hidden
                              h-6
                              w-6
                              items-center
                              justify-center
                              rounded-full
                              bg-emerald-400
                              text-slate-950
                              transition
                              hover:bg-emerald-300
                              group-hover:flex
                            "
                            title="Play"
                          >

                            <Play
                              className="
                                h-3
                                w-3
                                fill-current
                              "
                            />

                          </button>

                        </>

                      )}

                    </div>


                    {/* ==================================================
                        THUMBNAIL
                    =================================================== */}

                    <div
                      className="
                        h-12
                        w-12
                        shrink-0
                        overflow-hidden
                        rounded-xl
                        bg-slate-800
                      "
                    >

                      {song.thumbnail_url ? (

                        <img
                          src={song.thumbnail_url}
                          alt={song.title}
                          className="
                            h-full
                            w-full
                            object-cover
                          "
                        />

                      ) : (

                        <div
                          className="
                            flex
                            h-full
                            w-full
                            items-center
                            justify-center
                          "
                        >

                          <Music2
                            className="
                              h-5
                              w-5
                              text-slate-600
                            "
                          />

                        </div>

                      )}

                    </div>


                    {/* ==================================================
                        SONG INFO
                    =================================================== */}

                    <div
                      className="
                        min-w-0
                        flex-1
                      "
                    >

                      <h3
                        className={`
                          truncate
                          text-sm
                          font-bold
                          ${
                            active
                              ? 'text-emerald-400'
                              : 'text-white'
                          }
                        `}
                      >
                        {song.title}
                      </h3>


                      <p
                        className="
                          mt-1
                          truncate
                          text-[10px]
                          text-slate-600
                        "
                      >
                        {song.artist_name ||
                          song.artist ||
                          artistName}
                      </p>

                    </div>


                    {/* ==================================================
                        PREMIUM SONG INDICATOR
                    =================================================== */}

                    {(
                      song.is_premium ||
                      song.premium
                    ) && (

                      <Diamond
                        className="
                          h-4
                          w-4
                          shrink-0
                          fill-amber-300
                          text-amber-300
                        "
                        title="Premium"
                      />

                    )}


                    {/* ==================================================
                        LIKE
                    =================================================== */}

                    <button
                      type="button"
                      className="
                        flex
                        h-9
                        w-9
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        text-slate-600
                        transition
                        hover:bg-rose-500/10
                        hover:text-rose-400
                      "
                      title="Like"
                    >

                      <Heart className="h-4 w-4" />

                    </button>

                  </div>

                );

              }
            )}

          </div>

        </section>

      </div>

    </div>

  );

}