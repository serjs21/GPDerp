import axios from "axios";

export const runHaikuAgent = (subject: string) => axios.post('beer_me_haiku', { subject });