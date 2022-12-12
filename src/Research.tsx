import { useCallback, useState } from "react";
import { getToken } from "./api";
import Header from "./Header";

type SearchResponse = {
  searches: string[];
  allPageResults: [
    {
      url: string;
      title: string;
      snippet: string;
    },
    string
  ][];
  answer: string;
};

const sample: SearchResponse = JSON.parse(
  '{"searches":["\\"sleep environment tips\\"","\\"sleep routine tips\\""],"allPageResults":[[{"title":"Creating a Good Sleep Environment | NIOSH | CDC","url":"https://www.cdc.gov/niosh/emres/longhourstraining/environment.html","snippet":"To create a good sleep environment, Sleep in darkness. Make the sleeping area very dark if possible. Use room-darkening shades or heavy, lined draperies; pin drapes closed. Block any light entering the room. Keep a clear path to bathroom. Block or remove sources of white or blue light (any clock or watch with a white- or blue-lit dial, computer ..."},"\\n\\nTo have better sleep, make sure to create a good sleep environment. This includes sleeping in complete darkness, using room-darkening shades or heavy, lined draperies, keeping a clear path to the bathroom, blocking or removing sources of white or blue light, reducing noise with earplugs and silencing cell phone calls and nonessential alerts, and keeping the temperature cool. Avoid watching TV, reading, or working in the sleeping area. Additionally, make sure to establish a regular bedtime routine and practice good sleep hygiene habits."],[{"title":"Sleep tips: 6 steps to better sleep - Mayo Clinic","url":"https://www.mayoclinic.org/healthy-lifestyle/adult-health/in-depth/sleep/art-20048379","snippet":"5. Include physical activity in your daily routine. Regular physical activity can promote better sleep. However, avoid being active too close to bedtime. Spending time outside every day might be helpful, too. 6. Manage worries. Try to resolve your worries or concerns before bedtime."},"\\n\\nTo have better sleep, you should stick to a sleep schedule, pay attention to what you eat and drink, create a restful environment, limit daytime naps, include physical activity in your daily routine, and manage your worries. Avoid having heavy or large meals within a couple of hours of bedtime, as well as nicotine, caffeine, and alcohol. Make sure your bedroom is cool, dark, and quiet and turn off all screens, including your smartphone, an hour before bed. If you often have trouble sleeping, consider speaking to your healthcare provider to identify any underlying causes."],[{"title":"Tips for Better Sleep | CDC","url":"https://www.cdc.gov/sleep/about_sleep/sleep_hygiene.html","snippet":"Make sure your bedroom is quiet, dark, relaxing, and at a comfortable temperature. Remove electronic devices, such as TVs, computers, and smart phones, from the bedroom. Avoid large meals, caffeine, and alcohol before bedtime. Get some exercise. Being physically active during the day can help you fall asleep more easily at night."},"\\n\\nTo have better sleep, it is important to develop good sleep habits or “sleep hygiene”. This includes: \\n\\n- Going to bed and getting up at the same time each day, including on weekends. \\n- Ensuring your bedroom is quiet, dark, relaxing, and at a comfortable temperature. \\n- Removing electronic devices from the bedroom. \\n- Avoiding large meals, caffeine, and alcohol before bedtime. \\n- Getting regular exercise during the day. \\n\\nBy following these tips, you can improve your sleep health and get a good night’s rest. For more information, visit the website sleepeducation.org."],[{"title":"How to Sleep Better - Sleep Foundation","url":"https://www.sleepfoundation.org/sleep-hygiene/healthy-sleep-tips","snippet":"Taking control of your daily sleep schedule is a powerful step toward getting better sleep. To start harnessing your schedule for your benefit, try implementing these four strategies: Set a Fixed Wake-Up Time: It’s close to impossible for your body to get accustomed to a healthy sleep routine if you’re constantly waking up at different ..."},"\\n\\nTo have better sleep, it is important to optimize your sleep schedule, create a sleep-inducing bedroom, cultivate a pre-bedtime routine, and foster pro-sleep habits during the day. \\n\\nFor your sleep schedule, it is recommended to pick a fixed wake-up time and budget time for sleep by working backwards from the fixed wake-up time and identifying a target bedtime. Additionally, it is important to be careful with naps and make gradual adjustments when needed. \\n\\nTo create a sleep-inducing bedroom, you should use a high-performance mattress and pillow, choose quality bedding, avoid light disruption, cultivate peace and quiet, and find an agreeable temperature. Additionally, introducing pleasant aromas, such as essential oils, can help ease you into sleep. \\n\\nFor a pre-bedtime routine, it is important to make this time relaxing and calming. You could try reading a book, listening to calming music, meditating, or doing some gentle stretching. \\n\\nFinally, it is important to foster pro-sleep habits during the day. This includes avoiding caffeine late in the day, avoiding naps in the late afternoon or evening, avoiding screens before bed, avoiding alcohol and large meals before bed, and exercising regularly."]],"answer":"\\n\\nTo have better sleep, it is important to create a good sleep environment, establish a regular bedtime routine and practice good sleep hygiene habits, stick to a sleep schedule, pay attention to what you eat and drink, create a restful environment, limit daytime naps, and include physical activity in your daily routine. Additionally, make sure to avoid having heavy or large meals within a couple of hours of bedtime, as well as nicotine, caffeine, and alcohol. Make sure your bedroom is cool, dark, and quiet and turn off all screens, including your smartphone, an hour before bed. It is also important to develop good sleep habits or “sleep hygiene”, such as going to bed and getting up at the same time each day, ensuring your bedroom is quiet, dark, relaxing, and at a comfortable temperature, removing electronic devices from the bedroom, avoiding large meals, caffeine, and alcohol before bedtime, and getting regular exercise during the day. Finally, it is important to optimize your sleep schedule, create a sleep-inducing bedroom, cultivate a pre-bedtime routine, and foster pro-sleep habits during the day."}'
);

async function conductSearch(question: string): Promise<SearchResponse> {
  const response = await fetch(
    "https://wfsdcrnyu4bjh2xz3i4wc2iiue0tvlzs.lambda-url.us-east-1.on.aws/",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token: await getToken(),
        prompt: question,
      }),
    }
  );
  return await response.json();
}

function Response({ response }: { response: SearchResponse }) {
  console.log(response);
  const { searches, allPageResults, answer } = response;
  return (
    <>
      <p>
        <b>Searches:</b> {searches.join(", ")}
      </p>
      <p>
        <b>Answer:</b> {answer}
      </p>
      <p>
        <b>Page Results:</b>
      </p>
      <ul>
        {allPageResults.map(([page, answer], i) => (
          <li key={i}>
            <a href={page.url}>{page.title}</a>
            <p>{answer}</p>
          </li>
        ))}
      </ul>
    </>
  );
}

function Research() {
  const [question, setQuestion] = useState("How can I get better sleep?");
  const [status, setStatus] = useState<"idle" | "errored" | "pending">("idle");
  const [response, setResponse] = useState<SearchResponse>(sample);

  const submit = useCallback(async () => {
    setStatus("pending");
    try {
      setResponse(await conductSearch(question));
      setStatus("idle");
    } catch (e) {
      setStatus("errored");
    }
  }, [question]);

  return (
    <div
      style={{
        padding: "2rem",
        display: "flex",
        flexDirection: "column",
        width: "calc(min(100vw, max(60vw, 40rem)))",
        margin: "0 auto",
      }}
    >
      <Header>AugmateAI Research Playground</Header>
      <span>
        Powered by large language models. See the homepage:{" "}
        <a href="https://augmateai.michaelfatemi.com/">AugmateAI</a>
      </span>
      <span style={{ fontSize: "0.75rem" }}>
        Please be patient; it may take up to a minute to get a response. <br />
        The text you input here may be used to assess future use cases.
      </span>
      <h3 style={{ marginBottom: 0 }}>
        Type a question that is traditionally difficult to search online.
      </h3>
      <span>
        We will do our best to learn the background knowledge and generate an
        answer for you.
      </span>
      <input
        type="text"
        value={question}
        style={{ marginTop: "0.5rem" }}
        onKeyUp={(e) => {
          if (e.code === "Enter") {
            submit();
          }
        }}
        disabled={status === "pending"}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Submit any question"
      />
      {/* Prevent button from occupying full width */}
      <div style={{ marginTop: "0.5rem" }}>
        <button
          onClick={submit}
          disabled={status === "pending"}
          style={{ display: "inline-block" }}
        >
          Submit
        </button>
      </div>
      <Response response={response} />
    </div>
  );
}

export default Research;
