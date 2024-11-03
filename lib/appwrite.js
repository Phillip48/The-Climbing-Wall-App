import {
  Account,
  Avatars,
  Client,
  Databases,
  ID,
  Query,
  Storage,
  Permission,
  Role,
} from "react-native-appwrite";

export const appwriteConfig = {
  endpoint: "https://cloud.appwrite.io/v1",
  platform: "com.tcw.the-climbing-wall",
  projectId: "67211fe4001358d57083",
  storageId: "672122aa0024c1cf355f",
  databaseId: "672120e60015b0dfb179",
  userCollectionId: "67212100000dee7354bd",
  sendsCollectionId: "6721211f001033662fbd",
  projectsCollectionId: "672237f8000122f851cb",
};

const client = new Client();

client
  .setEndpoint(appwriteConfig.endpoint)
  .setProject(appwriteConfig.projectId)
  .setPlatform(appwriteConfig.platform);

const account = new Account(client);
const storage = new Storage(client);
const avatars = new Avatars(client);
const databases = new Databases(client);

// Register user
export async function createUser(
  email,
  password,
  username,
  maxBoulderingGrade,
  maxTopRopingGrade,
  bio
) {
  try {
    const newAccount = await account.create(
      ID.unique(),
      email,
      password,
      username,
      maxBoulderingGrade,
      maxTopRopingGrade,
      bio
    );

    if (!newAccount) throw Error;

    const avatarUrl = avatars.getInitials(username);

    await signIn(email, password);

    const newUser = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      ID.unique(),
      {
        accountId: newAccount.$id,
        email: email,
        username: username,
        avatar: avatarUrl,
        maxBoulderingGrade: maxBoulderingGrade,
        maxTopRopingGrade: maxTopRopingGrade,
        bio: bio,
      }
    );

    return newUser;
  } catch (error) {
    throw new Error(error);
  }
}

// Sign In
export async function signIn(email, password) {
  try {
    const session = await account.createEmailSession(email, password);

    return session;
  } catch (error) {
    throw new Error(error);
  }
}

// Get Account
export async function getAccount() {
  try {
    const currentAccount = await account.get();

    return currentAccount;
  } catch (error) {
    throw new Error(error);
  }
}

// Get Current User
export async function getCurrentUser() {
  try {
    const currentAccount = await getAccount();
    if (!currentAccount) throw Error;

    const currentUser = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      [Query.equal("accountId", currentAccount.$id)]
    );

    if (!currentUser) throw Error;

    return currentUser.documents[0];
  } catch (error) {
    console.log(error);
    return null;
  }
}

// Sign Out
export async function signOut() {
  try {
    const session = await account.deleteSession("current");

    return session;
  } catch (error) {
    throw new Error(error);
  }
}

// edit profile
export async function editProfile(form) {
  try {
    const updateUser = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      form.userId,
      {
        // username: form.username,
        // email: form.email,
        avatar: form.avatar,
        maxBoulderingGrade: form.maxBoulderingGrade,
        maxTopRopingGrade: form.maxTopRopingGrade,
        bio: form.bio,
      }
    );

    return updateUser;
  } catch (error) {
    throw new Error(error);
  }
}

export async function resetPassword(form) {
  try {
    const sendReset = await account.createRecovery(
      form.email,
      "/reset-pass" // redirect link to a page
    );

    // const passwordUpdate = await account.updateRecovery(
    //   "[USER_ID]",
    //   "[SECRET]",
    //   "password",
    //   "password"
    // );

    return;
  } catch (error) {
    throw new Error(error);
  }
}

// ================================================================================== //
// Upload File
export async function uploadFile(file, type) {
  if (!file) return;

  const { mimeType, ...rest } = file;
  const asset = { type: mimeType, ...rest };

  try {
    const uploadedFile = await storage.createFile(
      appwriteConfig.storageId,
      ID.unique(),
      asset
    );

    const fileUrl = await getFilePreview(uploadedFile.$id, type);
    return fileUrl;
  } catch (error) {
    throw new Error(error);
  }
}

// Get File Preview
export async function getFilePreview(fileId, type) {
  let fileUrl;

  try {
    if (type === "video") {
      fileUrl = storage.getFileView(appwriteConfig.storageId, fileId);
    } else if (type === "image") {
      fileUrl = storage.getFilePreview(
        appwriteConfig.storageId,
        fileId,
        2000,
        2000,
        "top",
        100
      );
    } else {
      throw new Error("Invalid file type");
    }

    if (!fileUrl) throw Error;

    return fileUrl;
  } catch (error) {
    throw new Error(error);
  }
}

// Create Send Post
export async function createSendPost(form) {
  let newAttempts = Number(form.attempts);
  // console.log("createSendPost", form.date);
  try {
    const [thumbnailUrl, videoUrl] = await Promise.all([
      uploadFile(form.thumbnail, "image"),
      uploadFile(form.video, "video"),
    ]);
    const newPost = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.sendsCollectionId,
      ID.unique(),
      {
        warmup: form.warmup,
        title: form.title,
        grade: form.grade,
        attempts: newAttempts,
        thumbnail: thumbnailUrl,
        video: videoUrl,
        users: form.userId,
        notes: form.notes,
        date: form.date,
        // If it came from a project should return true if normal send should be false
        project: false,
      }
    );
    let strGrade = form.grade.substring(1);
    let strMaxGrade = form.userMaxBoulderingGrade.substring(1);
    // console.log(form.userMaxBoulderingGrade < form.grade);
    // console.log(strMaxGrade < strGrade);
    // console.log("form grade", strGrade);
    // console.log("create form", form);

    if (
      form.grade.startsWith("5.") &&
      form.userMaxTopRopingGrade < form.grade
    ) {
      const updateUserMaxGrade = await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.userCollectionId,
        form.userId,
        {
          maxTopRopingGrade: form.grade,
        }
      );
      return updateUserMaxGrade;
    } else if (form.grade.startsWith("V") && strMaxGrade < strGrade) {
      const updateUserMaxGrade = await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.userCollectionId,
        form.userId,
        {
          maxBoulderingGrade: form.grade,
        }
      );
      return updateUserMaxGrade;
    }

    return newPost;
  } catch (error) {
    throw new Error(error);
  }
}

// Edit Send Post
export async function editSendPost(form) {
  let strGrade = form.grade.substring(1);
  let strMaxGrade = form.userMaxBoulderingGrade.substring(1);

  let newAttempts = Number(form.attempts);
  try {
    const [thumbnailUrl, videoUrl] = await Promise.all([
      uploadFile(form.thumbnail, "image"),
      uploadFile(form.video, "video"),
    ]);

    if (
      form.grade.startsWith("5.") &&
      form.userMaxTopRopingGrade < form.grade
    ) {
      const updateUserMaxGrade = await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.userCollectionId,
        form.userId,
        {
          maxTopRopingGrade: form.grade,
        }
      );
      return updateUserMaxGrade;
    } else if (
      form.grade.startsWith("V") &&
      Number(strMaxGrade) < Number(strGrade)
    ) {
      const updateUserMaxGrade = await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.userCollectionId,
        form.userId,
        {
          maxBoulderingGrade: form.grade,
        }
      );
      return updateUserMaxGrade;
    }
    const updatePost = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.sendsCollectionId,
      form.itemId,
      {
        warmup: form.warmup,
        title: form.title,
        grade: form.grade,
        attempts: newAttempts,
        thumbnail: thumbnailUrl,
        video: videoUrl,
        users: form.userId,
        notes: form.notes,
        date: form.date,
      }
    );

    return updatePost;
  } catch (error) {
    throw new Error(error);
  }
}

// Delete Send Post
export async function deleteSendPost(postId, userId) {
  // console.log(postId, userId);
  try {
    const deletePost = await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.sendsCollectionId,
      postId
      // Permission.delete(Role(userId))
    );

    // const userPosts = await databases.listDocuments(
    //   appwriteConfig.databaseId,
    //   appwriteConfig.sendsCollectionId,
    //   [Query.limit(5000)],
    //   [Query.equal("users", userId)]
    // );

    // console.log(userPosts.documents)
    // let maxBoulderingValue = userPosts.documents.reduce((acc, value) => {
    //   if(value.grade.startsWith('V')){
    //     return (acc = acc > value.grade.slice(1) ? acc : value.grade.slice(1));
    //   }
    // }, 0);
    // let maxTopRopingValue = userPosts.documents.reduce((acc, value) => {
    //   if(value.grade.startsWith('5.')){
    //     return (acc = acc > value.grade.slice(0, -1) ? acc : value.grade.slice(0, -1));
    //   }
    // }, 0);
    // console.log(maxBoulderingValue)
    // // console.log(maxTopRopingValue)

    // const updateUserMaxGrade = await databases.updateDocument(
    //   appwriteConfig.databaseId,
    //   appwriteConfig.userCollectionId,
    //   userId,
    //   {
    //     maxBoulderingGrade: "V" + maxBoulderingValue
    //   }
    // );

    return deletePost;
  } catch (error) {
    throw new Error(error);
  }
}

// Create Project Post
export async function createProjectPost(form) {
  let newAttempts = Number(form.attempts);
  let newSessions = Number(form.sessions);
  try {
    const [thumbnailUrl, videoUrl] = await Promise.all([
      uploadFile(form.thumbnail, "image"),
      uploadFile(form.video, "video"),
    ]);

    // If the climb was sent when creating the project then
    // create a send related to the project. Then update the send with the new project
    // 1. create send 2. create project 3. update send with project to link them
    if (form.climbsent === true) {
      const newSendPost = await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.sendsCollectionId,
        // ID.unique(),
        // to create and link a send with a project(below)
        ID.unique(),
        {
          warmup: false,
          title: form.title,
          grade: form.grade,
          attempts: newAttempts,
          thumbnail: thumbnailUrl,
          video: videoUrl,
          users: form.userId,
          notes: form.notes,
          date: form.date,
          // If it came from a project should return true
          project: true,
        }
      );
      // Update with user if its a new max // Newly added code
      let strGrade = form.grade.substring(1);
      let strMaxGrade = form.userMaxBoulderingGrade.substring(1);
      if (
        form.grade.startsWith("5.") &&
        form.userMaxTopRopingGrade < form.grade
      ) {
        const updateUserMaxGrade = await databases.updateDocument(
          appwriteConfig.databaseId,
          appwriteConfig.userCollectionId,
          form.userId,
          {
            maxTopRopingGrade: form.grade,
          }
        );
        return updateUserMaxGrade;
      } else if (form.grade.startsWith("V") && strMaxGrade < strGrade) {
        const updateUserMaxGrade = await databases.updateDocument(
          appwriteConfig.databaseId,
          appwriteConfig.userCollectionId,
          form.userId,
          {
            maxBoulderingGrade: form.grade,
          }
        );
        return updateUserMaxGrade;
      }
      // ========================================= //
      const newProjectPost = await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.projectsCollectionId,
        ID.unique(),
        {
          title: form.title,
          grade: form.grade,
          sessions: newSessions,
          attempts: newAttempts,
          thumbnail: thumbnailUrl,
          video: videoUrl,
          users: form.userId,
          notes: form.notes,
          date: form.date,
          climbsent: form.climbsent,
          // dont really need this since the project gets deleted once its sent
          sends: newSendPost.$id,
        }
      );
      // const updateSendPost = await databases.updateDocument(
      //   appwriteConfig.databaseId,
      //   appwriteConfig.sendsCollectionId,
      //   // ID.unique(),
      //   // to create and link a send with a project(below)
      //   newProjectPost.$id,
      //   {
      //     title: form.title,
      //     grade: form.grade,
      //     attempts: newAttempts,
      //     thumbnail: thumbnailUrl,
      //     video: videoUrl,
      //     users: form.userId,
      //     notes: form.notes,
      //     date: form.date,
      //     projects: newProjectPost.$id,
      //   }
      // );
      return newSendPost, newProjectPost, updateSendPost;

      // Project wasn't sent so just create the project and not the send
    } else {
      const newProjectPost = await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.projectsCollectionId,
        ID.unique(),
        {
          title: form.title,
          grade: form.grade,
          sessions: newSessions,
          attempts: newAttempts,
          thumbnail: thumbnailUrl,
          video: videoUrl,
          users: form.userId,
          notes: form.notes,
          date: form.date,
          climbsent: form.climbsent,
        }
      );
      return newProjectPost;
    }
  } catch (error) {
    throw new Error(error);
  }
}

// Edit Project Post
export async function editProjectPost(form) {
  console.log(form);
  let newAttempts = Number(form.attempts);
  let newSessions = Number(form.sessions);
  try {
    const [thumbnailUrl, videoUrl] = await Promise.all([
      uploadFile(form.thumbnail, "image"),
      uploadFile(form.video, "video"),
    ]);
    // climbsentstat to see if it changed meaning the project wasnt sent but is now
    if (form.climbsent === true && form.climbsentstat == true) {
      const newSendPost = await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.sendsCollectionId,
        ID.unique(),
        {
          warmup: false,
          title: form.title,
          grade: form.grade,
          attempts: newAttempts,
          thumbnail: thumbnailUrl,
          video: videoUrl,
          users: form.userId,
          notes: form.notes,
          date: form.date,
          // If it came from a project should return true
          project: true,
        }
      );
      // Update with user if its a new max // Newly added code
      let strGrade = form.grade.substring(1);
      let strMaxGrade = form.userMaxBoulderingGrade.substring(1);
      if (
        form.grade.startsWith("5.") &&
        form.userMaxTopRopingGrade < form.grade
      ) {
        const updateUserMaxGrade = await databases.updateDocument(
          appwriteConfig.databaseId,
          appwriteConfig.userCollectionId,
          form.userId,
          {
            maxTopRopingGrade: form.grade,
          }
        );
        return updateUserMaxGrade;
      } else if (form.grade.startsWith("V") && strMaxGrade < strGrade) {
        const updateUserMaxGrade = await databases.updateDocument(
          appwriteConfig.databaseId,
          appwriteConfig.userCollectionId,
          form.userId,
          {
            maxBoulderingGrade: form.grade,
          }
        );
        return updateUserMaxGrade;
      }
      // ========================================= //
      // delete from projects since it gets added to sends
      const newProjectPost = await databases.deleteDocument(
        appwriteConfig.databaseId,
        appwriteConfig.projectsCollectionId,
        form.itemId
        // {
        //   title: form.title,
        //   grade: form.grade,
        //   sessions: newSessions,
        //   attempts: newAttempts,
        //   thumbnail: thumbnailUrl,
        //   video: videoUrl,
        //   users: form.userId,
        //   notes: form.notes,
        //   date: form.date,
        //   climbsent: form.climbsent,
        //   sends: newSendPost.$id,
        // }
      );
      // const updateSendPost = await databases.updateDocument(
      //   appwriteConfig.databaseId,
      //   appwriteConfig.sendsCollectionId,
      //   newSendPost.$id,
      //   {
      //     title: form.title,
      //     grade: form.grade,
      //     attempts: newAttempts,
      //     thumbnail: thumbnailUrl,
      //     video: videoUrl,
      //     users: form.userId,
      //     notes: form.notes,
      //     date: form.date,
      //     projects: newProjectPost.$id,
      //   }
      // );
      // updateSendPost
      return newSendPost, newProjectPost;

      // Project wasn't sent so just update the project and not the send
    } else {
      const updatePost = await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.projectsCollectionId,
        form.itemId,
        {
          title: form.title,
          grade: form.grade,
          sessions: newSessions,
          attempts: newAttempts,
          thumbnail: thumbnailUrl,
          video: videoUrl,
          users: form.userId,
          notes: form.notes,
          climbsent: form.climbsent,
          date: form.date,
        }
      );
      return updatePost;
    }
  } catch (error) {
    throw new Error(error);
  }
}

// Delete Project Post
export async function deleteProjectPost(postId, userId) {
  // console.log(postId, userId);
  try {
    const deletePost = await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.projectsCollectionId,
      postId
      // Permission.delete(Role(userId))
    );

    return deletePost;
  } catch (error) {
    throw new Error(error);
  }
}

// Get all sends
export async function getAllSends() {
  try {
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.sendsCollectionId
      // [Query.limit(5000)],
    );

    return posts.documents;
  } catch (error) {
    throw new Error(error);
  }
}

// Get send posts created by user
export async function getUserSends(userId) {
  try {
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.sendsCollectionId,
      [Query.limit(5000)],
      [Query.equal("users", userId)]
    );

    return posts.documents;
  } catch (error) {
    throw new Error(error);
  }
}

// Get projects posts created by user
export async function getUsersProjects(userId) {
  try {
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.projectsCollectionId,
      [Query.limit(5000)],
      [Query.equal("users", userId)]
    );

    return posts.documents;
  } catch (error) {
    throw new Error(error);
  }
}

// Get send posts that matches search query
export async function searchSendsGrade(query) {
  // console.log(query);
  try {
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.sendsCollectionId,
      [Query.search("grade", query)]
    );

    if (!posts) throw new Error("Something went wrong");

    return posts.documents;
  } catch (error) {
    throw new Error(error);
  }
}

// Get project posts that matches search query
export async function searchProjectsGrade(query) {
  try {
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.projectsCollectionId,
      [Query.search("grade", query)]
    );

    if (!posts) throw new Error("Something went wrong");

    return posts.documents;
  } catch (error) {
    throw new Error(error);
  }
}

// Get latest created send posts
export async function getLatestSends(userId) {
  try {
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.sendsCollectionId,
      [
        Query.orderDesc("$createdAt"),
        Query.limit(10),
        Query.equal("users", userId),
      ]
    );

    return posts.documents;
  } catch (error) {
    throw new Error(error);
  }
}
