import { hash } from "bcryptjs";
import { fromEvent } from "graphcool-lib";
import * as validator from "validator";

const getGraphcoolUser = (api, email) => api.request(`
  query {
    User(email: "${email}") {
      id
    }
  }`)
  .then((userQueryResult) => userQueryResult.error
    ? Promise.reject(userQueryResult.error)
    : userQueryResult.User,
  );

const createGraphcoolUser = (api, email, passwordHash) => api.request(`
  mutation {
    createUser(
      email: "${email}",
      password: "${passwordHash}"
    ) {
      id
    }
  }`)
  .then((userMutationResult) => userMutationResult.createUser.id);

export default (event) => {
  if (!event.context.graphcool.pat) {
    return { error: "Email Signup not configured correctly." };
  }

  const email = event.data.email;
  const password = event.data.password;
  const graphcool = fromEvent(event);
  const api = graphcool.api("simple/v1");
  const SALT_ROUNDS = 10;

  if (!validator.isEmail(email)) { return { error: "Not a valid email" }; }
  return getGraphcoolUser(api, email)
    .then((graphcoolUser) => graphcoolUser !== null
      ? { error: "Email already in use" }
      : hash(password, SALT_ROUNDS)
        .then((hashResult) => createGraphcoolUser(api, email, hashResult))
        .then((graphcoolUserId) => graphcool.generateNodeToken(graphcoolUserId, "User")
          .then((token) => ({
            data: {
              id: graphcoolUserId,
              token,
            },
          }))),
    )
    .catch((error) => ({ error: error.message || error }));
};
