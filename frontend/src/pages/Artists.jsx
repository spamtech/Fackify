import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';

import { Link } from 'react-router-dom';

import {
  Search,
  Music2,
  Users,
  ChevronRight,
  Play,
  Pause,
  Diamond,
  Disc3,
  Sparkles,
  Headphones,
  AudioLines,
} from 'lucide-react';

import api from '../api/axiosInstance';

import { usePlayer } from '../context/PlayerContext';


/* ============================================================
   PREMIUM ARTIST FALLBACK
============================================================ */

const PREMIUM_ARTIST_IDS = [
  // 'PUT-ARTIST-UUID-HERE',
];


export default function Artists() {

  /* ==========================================================
     PLAYER
  ========================================================== */

  const {
    playSong,
    currentSong,
    isPlaying,
  } = usePlayer();


  /* ==========================================================
     STATE
  ========================================================== */

  const [artistsData, setArtistsData] =
    useState([]);

  const [songs, setSongs] =
    useState([]);

  const [search, setSearch] =
    useState('');

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');


  /* ==========================================================
     FETCH ARTISTS + SONGS
  ========================================================== */

  useEffect(() => {

    let mounted = true;

    const fetchData = async () => {

      try {

        setLoading(true);
        setError('');

        const [
          artistsResponse,
          songsResponse,
        ] = await Promise.all([
          api.get('/artists'),

          api.get('/songs', {
            params: {
              limit: 100,
              offset: 0,
            },
          }),
        ]);

        if (!mounted) {
          return;
        }

        const fetchedArtists =
          Array.isArray(
            artistsResponse.data?.artists
          )
            ? artistsResponse.data.artists
            : [];

        const fetchedSongs =
          Array.isArray(
            songsResponse.data?.songs
          )
            ? songsResponse.data.songs
            : [];

        setArtistsData(
          fetchedArtists
        );

        setSongs(
          fetchedSongs
        );

      } catch (err) {

        console.error(
          'Failed to fetch artists:',
          err
        );

        if (!mounted) {
          return;
        }

        setError(
          err.response?.data?.message ||
          'Unable to load artists'
        );

        setArtistsData([]);
        setSongs([]);

      } finally {

        if (mounted) {
          setLoading(false);
        }

      }

    };

    fetchData();

    return () => {
      mounted = false;
    };

  }, []);


  /* ==========================================================
     CREATE ARTIST LIST
  ========================================================== */

  const artists = useMemo(() => {

    return artistsData
      .filter((artist) => artist?.id)
      .map((artist) => {

        const artistId =
          String(artist.id);

        const artistSongs =
          songs.filter((song) => {

            /* PRIMARY ARTIST */

            if (
              song?.artist_id &&
              String(song.artist_id) ===
                artistId
            ) {
              return true;
            }

            /* MULTIPLE ARTIST IDS */

            if (
              Array.isArray(
                song?.artist_ids
              )
            ) {

              const found =
                song.artist_ids.some(
                  (id) =>
                    String(id) ===
                    artistId
                );

              if (found) {
                return true;
              }

            }

            /* MULTIPLE ARTISTS */

            if (
              Array.isArray(
                song?.artists
              )
            ) {

              const found =
                song.artists.some(
                  (item) => {

                    if (
                      item?.id &&
                      String(item.id) ===
                        artistId
                    ) {
                      return true;
                    }

                    if (
                      item?.artist_id &&
                      String(item.artist_id) ===
                        artistId
                    ) {
                      return true;
                    }

                    return false;
                  }
                );

              if (found) {
                return true;
              }

            }

            return false;

          });

        const backendSongCount =
          Number(
            artist.song_count
          ) || 0;

        const actualSongCount =
          artistSongs.length;

        return {

          id: artist.id,

          name:
            artist.name ||
            'Unknown Artist',

          image:
            artist.image_url ||
            null,

          isPremium:
            Boolean(
              artist.is_premium
            ),

          songCount:
            backendSongCount ||
            actualSongCount,

          songs:
            artistSongs,

        };

      });

  }, [
    artistsData,
    songs,
  ]);


  /* ==========================================================
     SEARCH
  ========================================================== */

  const filteredArtists =
    useMemo(() => {

      const value =
        search
          .trim()
          .toLowerCase();

      if (!value) {
        return artists;
      }

      return artists.filter(
        (artist) =>
          artist.name
            .toLowerCase()
            .includes(value)
      );

    }, [
      artists,
      search,
    ]);


  /* ==========================================================
     PREMIUM ARTIST
  ========================================================== */

  const isPremiumArtist =
    (artist) => {

      if (
        artist?.isPremium
      ) {
        return true;
      }

      return PREMIUM_ARTIST_IDS.some(
        (premiumId) =>
          String(premiumId) ===
          String(artist?.id)
      );

    };


  /* ==========================================================
     PLAY ARTIST
  ========================================================== */

  const handlePlayArtist =
    (
      event,
      artist
    ) => {

      event.preventDefault();
      event.stopPropagation();

      if (
        !artist?.songs ||
        artist.songs.length === 0
      ) {
        return;
      }

      playSong(
        artist.songs[0],
        artist.songs
      );

    };


  /* ==========================================================
     LOADING
  ========================================================== */

  if (loading) {

    return (

      <div className="min-h-[70vh] px-4 py-10 sm:px-6 lg:px-8">

        <div className="mx-auto max-w-7xl">

          <div className="mb-10">

            <div className="h-5 w-36 animate-pulse rounded-full bg-slate-800" />

            <div className="mt-4 h-11 w-64 animate-pulse rounded-xl bg-slate-800" />

            <div className="mt-3 h-4 w-96 max-w-full animate-pulse rounded bg-slate-900" />

          </div>

          <div
            className="
              grid
              grid-cols-2
              gap-5
              sm:grid-cols-3
              md:grid-cols-4
              lg:grid-cols-5
              xl:grid-cols-6
            "
          >

            {Array.from({
              length: 12,
            }).map(
              (_, index) => (

                <div
                  key={index}
                  className="
                    rounded-[30px]
                    border
                    border-slate-800/60
                    bg-slate-900/40
                    p-5
                  "
                >

                  <div
                    className="
                      mx-auto
                      aspect-square
                      w-full
                      max-w-44
                      animate-pulse
                      rounded-full
                      bg-slate-800
                    "
                  />

                  <div
                    className="
                      mx-auto
                      mt-6
                      h-4
                      w-28
                      animate-pulse
                      rounded
                      bg-slate-800
                    "
                  />

                  <div
                    className="
                      mx-auto
                      mt-3
                      h-3
                      w-20
                      animate-pulse
                      rounded
                      bg-slate-900
                    "
                  />

                </div>

              )
            )}

          </div>

        </div>

      </div>

    );

  }


  /* ==========================================================
     ERROR
  ========================================================== */

  if (error) {

    return (

      <div className="min-h-[70vh] px-4 py-10 sm:px-6 lg:px-8">

        <div className="mx-auto max-w-7xl">

          <div
            className="
              rounded-[30px]
              border
              border-rose-500/20
              bg-gradient-to-br
              from-rose-500/[0.08]
              via-slate-950/60
              to-transparent
              p-10
              text-center
            "
          >

            <div
              className="
                mx-auto
                flex
                h-16
                w-16
                items-center
                justify-center
                rounded-2xl
                border
                border-rose-400/20
                bg-rose-500/10
              "
            >

              <Users
                className="
                  h-7
                  w-7
                  text-rose-400
                "
              />

            </div>

            <p
              className="
                mt-5
                text-sm
                font-bold
                text-rose-400
              "
            >
              {error}
            </p>

            <p
              className="
                mt-2
                text-xs
                text-slate-500
              "
            >
              Please refresh the page and try again.
            </p>

          </div>

        </div>

      </div>

    );

  }


  /* ==========================================================
     MAIN
  ========================================================== */

  return (

    <div
      className="
        relative
        min-h-[70vh]
        overflow-hidden
        pb-24
      "
    >

      {/* ======================================================
          PREMIUM AMBIENT LIGHTS
      ======================================================= */}

      <div
        className="
          pointer-events-none
          absolute
          -left-40
          top-0
          h-[420px]
          w-[420px]
          rounded-full
          bg-emerald-500/[0.08]
          blur-[130px]
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          right-[-100px]
          top-20
          h-[380px]
          w-[380px]
          rounded-full
          bg-cyan-500/[0.06]
          blur-[130px]
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          left-1/2
          top-[600px]
          h-[350px]
          w-[350px]
          -translate-x-1/2
          rounded-full
          bg-violet-500/[0.035]
          blur-[120px]
        "
      />


      <div
        className="
          relative
          mx-auto
          max-w-7xl
          px-4
          py-8
          sm:px-6
          sm:py-10
          lg:px-8
        "
      >

        {/* ====================================================
            HEADER
        ===================================================== */}

        <div
          className="
            flex
            flex-col
            gap-7
            md:flex-row
            md:items-end
            md:justify-between
          "
        >

          <div>

            <div
              className="
                mb-5
                inline-flex
                items-center
                gap-2
                rounded-full
                border
                border-emerald-400/20
                bg-gradient-to-r
                from-emerald-400/[0.10]
                to-cyan-400/[0.05]
                px-3.5
                py-1.5
                shadow-lg
                shadow-emerald-500/[0.04]
              "
            >

              <Sparkles
                className="
                  h-3
                  w-3
                  text-emerald-400
                "
              />

              <span
                className="
                  text-[9px]
                  font-black
                  uppercase
                  tracking-[0.24em]
                  text-emerald-400
                "
              >
                Fackify Artists
              </span>

            </div>


            <h1
              className="
                text-3xl
                font-black
                tracking-[-0.04em]
                text-white
                sm:text-4xl
                lg:text-5xl
              "
            >
              Discover Artists
            </h1>


            <p
              className="
                mt-3
                max-w-xl
                text-sm
                leading-6
                text-slate-500
              "
            >
              Explore your favourite artists and
              dive into their complete music collection.
            </p>

          </div>


          {/* ==================================================
              SEARCH
          =================================================== */}

          <div
            className="
              relative
              w-full
              md:w-80
            "
          >

            <Search
              className="
                pointer-events-none
                absolute
                left-4
                top-1/2
                h-4
                w-4
                -translate-y-1/2
                text-slate-600
              "
            />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search artists..."
              className="
                w-full
                rounded-2xl
                border
                border-slate-800/80
                bg-slate-900/60
                py-3.5
                pl-11
                pr-4
                text-sm
                font-medium
                text-white
                outline-none
                placeholder:text-slate-600
                backdrop-blur-2xl
                transition-all
                duration-300
                focus:border-emerald-400/30
                focus:bg-slate-900/90
                focus:ring-4
                focus:ring-emerald-400/[0.05]
              "
            />

          </div>

        </div>


        {/* ====================================================
            STATS
        ===================================================== */}

        <div
          className="
            mt-8
            flex
            flex-wrap
            items-center
            gap-3
          "
        >

          <div
            className="
              inline-flex
              items-center
              gap-2
              rounded-full
              border
              border-slate-800/80
              bg-slate-900/60
              px-3.5
              py-1.5
              shadow-lg
              shadow-black/10
              backdrop-blur-xl
            "
          >

            <Users
              className="
                h-3.5
                w-3.5
                text-emerald-400
              "
            />

            <span
              className="
                text-[10px]
                font-bold
                text-slate-400
              "
            >
              {filteredArtists.length}
              {' '}
              {filteredArtists.length === 1
                ? 'Artist'
                : 'Artists'}
            </span>

          </div>


          {search && (

            <div
              className="
                rounded-full
                border
                border-cyan-400/10
                bg-cyan-400/[0.05]
                px-3.5
                py-1.5
                text-[10px]
                font-semibold
                text-cyan-400
              "
            >
              Results for "{search}"
            </div>

          )}

        </div>


        {/* ====================================================
            ARTIST GRID
        ===================================================== */}

        {filteredArtists.length > 0 ? (

          <div
            className="
              mt-8
              grid
              grid-cols-2
              gap-4
              sm:grid-cols-3
              sm:gap-5
              md:grid-cols-4
              lg:grid-cols-5
              xl:grid-cols-6
            "
          >

            {filteredArtists.map(
              (artist) => {

                const premium =
                  isPremiumArtist(
                    artist
                  );

                const isCurrentArtistPlaying =
                  artist.songs.some(
                    (song) =>
                      String(song.id) ===
                        String(
                          currentSong?.id
                        ) &&
                      isPlaying
                  );

                const isCurrentArtist =
                  artist.songs.some(
                    (song) =>
                      String(song.id) ===
                      String(
                        currentSong?.id
                      )
                  );


                return (

                  <Link
                    key={String(artist.id)}
                    to={`/artists/${artist.id}`}
                    className={`
                      group
                      relative
                      overflow-hidden
                      rounded-[30px]
                      border
                      bg-gradient-to-b
                      from-slate-900/90
                      via-slate-900/75
                      to-slate-950/90
                      p-4
                      shadow-xl
                      shadow-black/20
                      backdrop-blur-2xl
                      transition-all
                      duration-500
                      hover:-translate-y-2
                      hover:shadow-2xl
                      sm:p-5

                      ${
                        premium
                          ? 'border-cyan-400/20 hover:border-cyan-300/35 hover:shadow-cyan-500/[0.08]'
                          : 'border-slate-800/70 hover:border-emerald-400/20 hover:shadow-emerald-500/[0.08]'
                      }
                    `}
                  >

                    {/* =================================================
                        PREMIUM TOP SHINE
                    ================================================== */}

                    <div
                      className="
                        pointer-events-none
                        absolute
                        inset-x-0
                        top-0
                        h-px
                        bg-gradient-to-r
                        from-transparent
                        via-white/20
                        to-transparent
                        opacity-50
                      "
                    />


                    {/* =================================================
                        HOVER GLOW
                    ================================================== */}

                    <div
                      className={`
                        pointer-events-none
                        absolute
                        -right-16
                        -top-16
                        h-40
                        w-40
                        rounded-full
                        blur-[70px]
                        opacity-0
                        transition-all
                        duration-700
                        group-hover:opacity-100

                        ${
                          premium
                            ? 'bg-cyan-400/20'
                            : 'bg-emerald-400/15'
                        }
                      `}
                    />


                    <div
                      className="
                        pointer-events-none
                        absolute
                        -bottom-20
                        -left-10
                        h-36
                        w-36
                        rounded-full
                        bg-violet-500/[0.08]
                        blur-[70px]
                        opacity-0
                        transition-opacity
                        duration-700
                        group-hover:opacity-100
                      "
                    />


                    {/* =================================================
                        IMAGE + OUTSIDE CONTROLS
                    ================================================== */}

                    <div
                      className="
                        relative
                        mx-auto
                        w-full
                        max-w-48
                        pt-1
                      "
                    >

                      {/* IMAGE GLOW */}

                      <div
                        className={`
                          pointer-events-none
                          absolute
                          inset-5
                          rounded-full
                          blur-3xl
                          transition-all
                          duration-700

                          ${
                            isCurrentArtistPlaying
                              ? 'bg-emerald-400/25 opacity-100 scale-110'
                              : premium
                                ? 'bg-cyan-400/10 opacity-60 group-hover:opacity-100 group-hover:scale-110'
                                : 'bg-emerald-400/10 opacity-0 group-hover:opacity-100 group-hover:scale-110'
                          }
                        `}
                      />


                      {/* OUTER RING */}

                      <div
                        className={`
                          relative
                          aspect-square
                          rounded-full
                          p-[3px]
                          transition-all
                          duration-700

                          ${
                            isCurrentArtistPlaying
                              ? 'bg-gradient-to-br from-emerald-300 via-emerald-400 to-cyan-400 shadow-lg shadow-emerald-500/30'
                              : premium
                                ? 'bg-gradient-to-br from-cyan-300/60 via-cyan-400/20 to-violet-400/40 group-hover:from-cyan-300 group-hover:via-cyan-400/50 group-hover:to-violet-400'
                                : 'bg-gradient-to-br from-slate-700 via-slate-800 to-slate-700 group-hover:from-emerald-400/60 group-hover:via-emerald-400/20 group-hover:to-cyan-400/50'
                          }
                        `}
                      >

                        {/* IMAGE */}

                        <div
                          className="
                            relative
                            h-full
                            w-full
                            overflow-hidden
                            rounded-full
                            border
                            border-black/40
                            bg-slate-950
                            shadow-2xl
                          "
                        >

                          {artist.image ? (

                            <img
                              src={artist.image}
                              alt={artist.name}
                              className="
                                h-full
                                w-full
                                object-cover
                                transition-transform
                                duration-700
                                group-hover:scale-110
                              "
                              loading="lazy"
                              onError={(event) => {
                                event.currentTarget.style.display =
                                  'none';
                              }}
                            />

                          ) : (

                            <div
                              className="
                                flex
                                h-full
                                w-full
                                items-center
                                justify-center
                                bg-gradient-to-br
                                from-emerald-500/20
                                via-slate-900
                                to-cyan-500/10
                              "
                            >

                              <Music2
                                className="
                                  h-14
                                  w-14
                                  text-emerald-400
                                  transition-transform
                                  duration-700
                                  group-hover:scale-110
                                "
                              />

                            </div>

                          )}


                          {/* IMAGE OVERLAY */}

                          <div
                            className="
                              pointer-events-none
                              absolute
                              inset-0
                              rounded-full
                              bg-gradient-to-t
                              from-black/40
                              via-transparent
                              to-white/[0.08]
                            "
                          />

                        </div>

                      </div>


                      {/* =================================================
                          PREMIUM BADGE
                      ================================================== */}

                      {premium && (

                        <div
                          className="
                            absolute
                            right-1
                            top-1
                            flex
                            h-9
                            w-9
                            items-center
                            justify-center
                            rounded-full
                            border
                            border-cyan-200/30
                            bg-slate-950/90
                            shadow-xl
                            shadow-cyan-500/20
                            backdrop-blur-xl
                            transition-all
                            duration-500
                            group-hover:scale-110
                            group-hover:rotate-6
                          "
                          title="Premium Artist"
                        >

                          <Diamond
                            className="
                              h-4
                              w-4
                              fill-cyan-300
                              text-cyan-300
                            "
                          />

                        </div>

                      )}


                      {/* =================================================
                          PLAY BUTTON OUTSIDE IMAGE
                      ================================================== */}

                      <button
                        type="button"
                        onClick={(event) =>
                          handlePlayArtist(
                            event,
                            artist
                          )
                        }
                        disabled={
                          artist.songs.length === 0
                        }
                        className={`
                          absolute
                          bottom-1
                          right-1
                          flex
                          h-11
                          w-11
                          items-center
                          justify-center
                          rounded-full
                          border
                          border-white/20
                          text-slate-950
                          shadow-2xl
                          backdrop-blur-xl
                          transition-all
                          duration-300
                          hover:scale-110
                          active:scale-95
                          disabled:cursor-not-allowed
                          disabled:opacity-40

                          ${
                            isCurrentArtistPlaying
                              ? 'bg-white shadow-white/20'
                              : 'bg-emerald-400 shadow-emerald-500/30 hover:bg-emerald-300'
                          }
                        `}
                        title={
                          artist.songs.length === 0
                            ? 'No songs available'
                            : isCurrentArtistPlaying
                              ? `Pause ${artist.name}`
                              : `Play ${artist.name}`
                        }
                      >

                        {isCurrentArtistPlaying ? (

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
                              ml-0.5
                              h-4
                              w-4
                              fill-current
                            "
                          />

                        )}

                      </button>


                      {/* =================================================
                          PLAYING INDICATOR OUTSIDE IMAGE
                      ================================================== */}

                      {isCurrentArtistPlaying && (

                        <div
                          className="
                            absolute
                            bottom-0
                            left-1
                            flex
                            items-center
                            gap-1.5
                            rounded-full
                            border
                            border-emerald-400/20
                            bg-slate-950/90
                            px-2.5
                            py-1.5
                            shadow-xl
                            shadow-emerald-500/10
                            backdrop-blur-xl
                          "
                        >

                          <div
                            className="
                              flex
                              h-3
                              items-end
                              gap-[2px]
                            "
                          >

                            <span
                              className="
                                h-1
                                w-[2px]
                                animate-pulse
                                rounded-full
                                bg-emerald-400
                              "
                            />

                            <span
                              className="
                                h-2.5
                                w-[2px]
                                animate-pulse
                                rounded-full
                                bg-emerald-400
                              "
                            />

                            <span
                              className="
                                h-1.5
                                w-[2px]
                                animate-pulse
                                rounded-full
                                bg-emerald-400
                              "
                            />

                            <span
                              className="
                                h-2
                                w-[2px]
                                animate-pulse
                                rounded-full
                                bg-emerald-400
                              "
                            />

                          </div>

                          <span
                            className="
                              text-[7px]
                              font-black
                              uppercase
                              tracking-[0.15em]
                              text-emerald-400
                            "
                          >
                            Playing
                          </span>

                        </div>

                      )}

                    </div>


                    {/* =================================================
                        ARTIST INFORMATION
                    ================================================== */}

                    <div
                      className="
                        relative
                        mt-6
                        text-center
                      "
                    >

                      <div
                        className="
                          flex
                          items-center
                          justify-center
                          gap-1.5
                        "
                      >

                        <h2
                          className="
                            max-w-[85%]
                            truncate
                            text-sm
                            font-black
                            tracking-tight
                            text-white
                            transition-colors
                            duration-300
                            group-hover:text-emerald-400
                          "
                        >
                          {artist.name}
                        </h2>

                        {premium && (

                          <Diamond
                            className="
                              h-3
                              w-3
                              shrink-0
                              fill-cyan-300
                              text-cyan-300
                            "
                          />

                        )}

                      </div>


                      <div
                        className="
                          mt-2.5
                          flex
                          items-center
                          justify-center
                          gap-1.5
                        "
                      >

                        <Disc3
                          className="
                            h-3
                            w-3
                            text-slate-600
                          "
                        />

                        <p
                          className="
                            text-[10px]
                            font-semibold
                            text-slate-600
                          "
                        >
                          {artist.songCount}
                          {' '}
                          {artist.songCount === 1
                            ? 'song'
                            : 'songs'}
                        </p>

                      </div>


                      {/* =================================================
                          PREMIUM LABEL
                      ================================================== */}

                      {premium && (

                        <div
                          className="
                            mt-3
                            inline-flex
                            items-center
                            gap-1.5
                            rounded-full
                            border
                            border-cyan-400/15
                            bg-gradient-to-r
                            from-cyan-400/[0.08]
                            to-violet-400/[0.05]
                            px-2.5
                            py-1
                          "
                        >

                          <Sparkles
                            className="
                              h-2.5
                              w-2.5
                              text-cyan-300
                            "
                          />

                          <span
                            className="
                              text-[7px]
                              font-black
                              uppercase
                              tracking-[0.16em]
                              text-cyan-400
                            "
                          >
                            Premium Artist
                          </span>

                        </div>

                      )}

                    </div>


                    {/* =================================================
                        PLAYING SONG INFO
                    ================================================== */}

                    {isCurrentArtist && (

                      <div
                        className="
                          mt-4
                          rounded-2xl
                          border
                          border-emerald-400/10
                          bg-emerald-400/[0.04]
                          px-3
                          py-2
                          text-center
                        "
                      >

                        <div
                          className="
                            flex
                            items-center
                            justify-center
                            gap-1.5
                          "
                        >

                          <AudioLines
                            className="
                              h-3
                              w-3
                              text-emerald-400
                            "
                          />

                          <span
                            className="
                              max-w-[85%]
                              truncate
                              text-[8px]
                              font-bold
                              text-emerald-400
                            "
                          >
                            {isPlaying
                              ? `Playing ${currentSong?.title || 'music'}`
                              : 'Paused'}
                          </span>

                        </div>

                      </div>

                    )}


                    {/* =================================================
                        EXPLORE BUTTON
                    ================================================== */}

                    <div
                      className="
                        relative
                        mt-4
                        flex
                        items-center
                        justify-center
                        gap-1.5
                        rounded-xl
                        border
                        border-transparent
                        py-2
                        text-[8px]
                        font-black
                        uppercase
                        tracking-[0.18em]
                        text-slate-600
                        transition-all
                        duration-300
                        group-hover:border-emerald-400/10
                        group-hover:bg-emerald-400/[0.04]
                        group-hover:text-emerald-400
                      "
                    >

                      Explore Artist

                      <ChevronRight
                        className="
                          h-3
                          w-3
                          transition-transform
                          duration-300
                          group-hover:translate-x-1
                        "
                      />

                    </div>


                    {/* =================================================
                        ACTIVE BOTTOM LINE
                    ================================================== */}

                    <div
                      className={`
                        absolute
                        bottom-0
                        left-1/2
                        h-[2px]
                        -translate-x-1/2
                        rounded-full
                        bg-gradient-to-r
                        from-emerald-400
                        via-cyan-400
                        to-violet-400
                        transition-all
                        duration-500

                        ${
                          isCurrentArtistPlaying
                            ? 'w-20 opacity-100'
                            : 'w-0 opacity-0 group-hover:w-12 group-hover:opacity-100'
                        }
                      `}
                    />

                  </Link>

                );

              }
            )}

          </div>

        ) : (

          /* ==================================================
             NO ARTISTS
          =================================================== */

          <div
            className="
              mt-10
              rounded-[30px]
              border
              border-slate-800/70
              bg-gradient-to-br
              from-slate-900/70
              via-slate-950/70
              to-slate-950/50
              px-6
              py-20
              text-center
              shadow-2xl
              shadow-black/20
            "
          >

            <div
              className="
                mx-auto
                flex
                h-16
                w-16
                items-center
                justify-center
                rounded-2xl
                border
                border-slate-800
                bg-slate-900
                shadow-xl
              "
            >

              <Headphones
                className="
                  h-7
                  w-7
                  text-slate-600
                "
              />

            </div>


            <h2
              className="
                mt-6
                text-base
                font-black
                text-white
              "
            >
              No artists found
            </h2>


            <p
              className="
                mx-auto
                mt-2
                max-w-sm
                text-xs
                leading-5
                text-slate-600
              "
            >
              {search
                ? 'Try searching for another artist or clear your search to see all artists.'
                : 'No artists have been added to Fackify yet.'}
            </p>


            {search && (

              <button
                type="button"
                onClick={() =>
                  setSearch('')
                }
                className="
                  mt-6
                  rounded-xl
                  border
                  border-emerald-400/20
                  bg-emerald-400/10
                  px-4
                  py-2.5
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-wider
                  text-emerald-400
                  transition
                  hover:bg-emerald-400/15
                "
              >
                Clear Search
              </button>

            )}

          </div>

        )}

      </div>

    </div>

  );

}