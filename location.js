const { createContentDigest } = require(`gatsby-core-utils`);
const Queue = require(`better-queue`);
const ProgressBar = require(`progress`);
const axios = require("axios");
const rateLimit = require("axios-rate-limit");
const http = rateLimit(axios.create(), {
  maxRequests: 1,
  perMilliseconds: 1010,
});

async function loadLocation(place) {
  const url = `https://nominatim.openstreetmap.org/search/${encodeURIComponent(
    place
  )}?format=json`;

  const res = await http(url, {
    headers: {
      "User-Agent": "family.jamesst.one  - A personal family tree",
    },
  });
  if (!res.status !== 200) return { lat: null, lng: null };
  const location = res.data;

  return {
    lat: location && location.hasOwnProperty("lat") ? location.lat : null,
    lng: location && location.hasOwnProperty("lon") ? location.lon : null,
  };
}

function createProgress(message, reporter) {
  if (reporter && reporter.createProgress) {
    return reporter.createProgress(message);
  }

  const bar = new ProgressBar(
    ` [:bar] :current/:total :elapsed s :percent ${message}`,
    {
      total: 0,
      width: 30,
      clear: true,
    }
  );

  return {
    start() {},
    tick() {
      bar.tick();
    },
    done() {},
    set total(value) {
      bar.total = value;
    },
  };
}

const cacheId = (location) => `create-remote-location-node-${location}`;

let bar;
// Keep track of the total number of jobs we push in the queue
let totalJobs = 0;

/**
 * Queue
 * Use the task's location as the id
 * When pushing a task with a similar id, prefer the original task
 * as it's already in the processing cache
 */
const queue = new Queue(pushToQueue, {
  id: `location`,
  merge: (old, _, cb) => cb(old),
  concurrent: 1,
});

// when the queue is empty we stop the progressbar
queue.on(`drain`, () => {
  if (bar) {
    bar.done();
  }
  totalJobs = 0;
});

async function pushToQueue(task, cb) {
  try {
    const node = await processRemoteNode(task);
    return cb(null, node);
  } catch (e) {
    console.error("pushToQueue - Error", { task, e });
    return cb(e);
  }
}

async function processRemoteNode({
  location,
  cache,
  createNode,
  parentNodeId,
  auth = {},
  httpHeaders = {},
  createNodeId,
  ext,
  name,
}) {
  // See if there's response headers for this url
  // from a previous request.
  const cachedLocation = await cache.get(cacheId(location));
  const place = cachedLocation || (await loadLocation(location));
  await cache.set(cacheId(location), place);
  return place;
}

/**
 * Index of promises resolving to File node from remote url
 */
const processingCache = {};
/**
 * pushTask
 * --
 * pushes a task in to the Queue and the processing cache
 *
 * Promisfy a task in queue
 * @param {CreateRemoteFileNodePayload} task
 * @return {Promise<Object>}
 */
const pushTask = (task) =>
  new Promise((resolve, reject) => {
    queue
      .push(task)
      .on(`finish`, (task) => {
        resolve(task);
      })
      .on(`failed`, (err) => {
        reject(`failed to process ${task.location}\n${err}`);
      });
  });

/***************
 * Entry Point *
 ***************/

/**
 * createRemoteFileNode
 * --
 *
 * Download a remote location
 * First checks cache to ensure duplicate requests aren't processed
 * Then pushes to a queue
 *
 * @param {CreateRemoteFileNodePayload} options
 * @return {Promise<Object>}                  Returns the created node
 */
module.exports = ({
  location: l,
  cache,
  createNode,
  getCache,
  parentNodeId = null,
  auth = {},
  httpHeaders = {},
  createNodeId,
  ext = null,
  name = null,
  reporter,
}) => {
  // validation of the input
  // without this it's notoriously easy to pass in the wrong `createNodeId`
  // see gatsbyjs/gatsby#6643
  if (typeof createNodeId !== `function`) {
    throw new Error(
      `createNodeId must be a function, was ${typeof createNodeId}`
    );
  }
  if (typeof createNode !== `function`) {
    throw new Error(`createNode must be a function, was ${typeof createNode}`);
  }
  if (typeof getCache === `function`) {
    // use cache of this plugin and not cache of function caller
    cache = getCache(`gatsby-source-filesystem`);
  }
  if (typeof cache !== `object`) {
    throw new Error(
      `Neither "cache" or "getCache" was passed. getCache must be function that return Gatsby cache, "cache" must be the Gatsby cache, was ${typeof cache}`
    );
  }

  if (!l) {
    return Promise.reject(`missing location: ${l}`);
  }
  const location = l.trim();

  // Check if we already requested node for this remote file
  // and return stored promise if we did.
  if (processingCache[location]) {
    return processingCache[location];
  }

  if (totalJobs === 0) {
    bar = createProgress(`Downloading remote locations`, reporter);
    bar.start();
  }

  totalJobs += 1;
  bar.total = totalJobs;

  const locationDownloadPromise = pushTask({
    location,
    cache,
    createNode,
    parentNodeId,
    createNodeId,
    auth,
    httpHeaders,
    ext,
    name,
  });

  processingCache[location] = locationDownloadPromise.then((location) => {
    bar.tick();
    return location;
  });

  return processingCache[location];
};
