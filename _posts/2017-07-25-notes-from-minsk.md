---
title: Notes from Minsk
tags: []
---

Will Sewell and I gave our "Go garbage collector" talk at GoWayFest in Minsk.
There are very few direct flights to Minsk, so Will and I flew via Kiev.
During the layover in Kiev, it rained tropically.
We arrived at GoWayFest on Thursday evening after travelling all day.
When we got to our Airbnb, we were told to go to a different address.
It wasn’t the place we booked, but the hosts spoke no English and we were happy to sleep anywhere.

Apart from this initial scam, Minsk was quite orderly.
On the way from the airport, we discovered that it’s the "Russian Las Vagas".
The roads were almost paved with casinos.
The commercial streets were clean and fancily lit.
However, once you go around the back to the residential areas, you find innumerable blocks of identical USSR-era housing, where it’s easy to get lost.

We were due to speak early on Friday, but we moved to the end of the day.
GoWayFest was a two-track conference: one English track, and one Russian.
Belarusian is distinct from Russian, but most Belarusians just speak Russian, and there were also many Russians who had travelled to the conference.
The most remote visitor I spoke to was [Elena](https://twitter.com/webdeva) from Novosibirsk,
which to me seems like almost Siberia.
She hosts [The Golang Show](http://golangshow.com/), a popular Go podcast.
Rob Pike was on their show once.

First on Friday there was an introduction from [Juno](https://gojuno.com/),
the main company behind the conference.
Juno are similar to Uber.
They have taxis and a small office in New York, but their developers are almost entirely in Minsk.
We were told that there are 35 professional Go programmers in Minsk.
I reckon most of those are hired by Juno.
Over the weekend, it became clear that Juno is a very desirable company to work for in Minsk.
Will mentioned that "software developer" is apparently the equivalent of "footballer"
in the dreams of Belarusian children,
and it seemed like Juno is a good team to play for.

The first scheduled talk was from [Eyal Post](https://www.linkedin.com/in/eyalpost), who works at Gett in Israel.
Gett is another taxi company!
Recently, Gett bought Juno for $200M.
Gett and Juno operate in different areas of the world and the purchase helps them both compete with Uber.
Eyal talked about "Why Go Scales" -
specifically, how Go efficiently handles lots of concurrent connections.
Just like Pusher, Gett recently switched from Ruby to Go.
At the start of Eyal’s talk, he explained the "C10K problem",
and why it’s a problem in languages like Ruby:
Ruby uses OS threads for concurrency, which has a high overhead due to context switching.
Go "scales" because it implements concurrency differently:
the runtime manages OS threads,
while your program only spawns "goroutines" which are assigned to OS threads.
Eyal explained an interesting consequence of Go’s cooperative scheduler:
a Goroutine can run forever and starve other Goroutines from ever running.
This can only happen in hot loops which don’t call any functions.
He mentioned Go’s networking implementation,
which uses [netpoller](https://golang.org/src/runtime/netpoll.go).
Apparently all networking happens in a single OS thread on behalf of all other goroutines.
Underneath, netpoller uses epoll, kqueue, IOCP, or whatever other high-performance networking system calls the OS provides.

The second talk on the English track was in Russian!
Instead, Will and I spoke to [Yuras Shumovich](https://twitter.com/shumovichy), who already knew us!
Yuras is in the Haskell community, and [had commented on the Haskell blog post that Will and I wrote last year](https://www.reddit.com/r/haskell/comments/4j0imi/ghc_cannot_achieve_low_latency_with_a_large/d32n6hm/).
Yuras is a contractor in Minsk.

The third talk was from [Mike Kabishev](https://twitter.com/mkabischev), another Juno developer.
Mike explained how to do "middleware" in Go.
A middleware is something which transforms HTTP handlers -
it takes a request handler and gives you a new one.
It’s a common pattern in many languages for doing boring HTTP tasks.
Go in general discourages abstraction, but this abstraction works fairly cleanly.
One interesting principle Mike mentioned was that "Go functions should accept interfaces and return structs".
I think the idea is that the function signature should demand as little as possible, but guarantee as much as possible.
In CS-speak this is "weakest precondition, strongest postcondition".
However, lots of big Go libraries violate this principle.

The fourth talk was the last before lunch.
Max Chechel talked about code generation.
Only ~10% of code is business logic!
The rest is logging, metrics, auth, tests, mocks, et cetera.
Maybe we should generate this stuff?
Max introduced some code generation tools they’ve developed at Juno (he’s another Gett employee).
`typeface` is a tool which generates a Go interface from a Go struct.
This works together with `minimock`,
which takes an interface and generates a struct which implements it (a mock).
I was reminded of the work [Michael Walker](https://www.barrucadu.co.uk/) did on Pusher's [go-interface-fuzzer](https://github.com/pusher/go-interface-fuzzer).
Max also mentioned the concept of "table tests".
This is where you have a function to test,
and you list out pairs of (input, expected output) as your tests.

Then it was lunch.
We were given an impromptu tour of Minsk by car.
(Everyone seemed very friendly and keen to interact with us.
I don’t know if it’s the Belarusian way, or because we were unusual people from London.)
We drove through the hipsterish area of the city where the conference was located.
There were lots of huge (everything in the east seems larger than it should be) street graffiti installations.
We drove past lots of Minsk parks, all of which were extraordinarily clean and smart.
Alexander Lukashenko, the Belarusian "president", is a big fan of cleanliness.
Throughout the weekend, I warmed to the semi-dictator for his ability to manage the country.
Apparently he does keep the parks clean by making all the unemployed people clean them.
"100% employment!"

During the car trip, [Daria Shabala](https://www.linkedin.com/in/darya-shabala-58346344), the conference organizer, called us wondering where we were.
Apparently they had organized a speakers’ lunch, but we hadn’t realized.
When we got back, Daria gave us our vegan noodle lunch.
I felt a bit guilty, especially since they had arranged it specially - veganism is not very common in Belarus.
Daria seemed to be organizing every aspect of the conference.
I was very impressed with her seemingly effortless ability to keep everything together.

After lunch, [Ivan Danyliuk](https://twitter.com/idanyliuk) showed us his Go concurrency visualizer, [gotrace](https://github.com/divan/gotrace).
It creates a 3D visualization of Goroutines and message-passing in one run of a Go program.
To achieve this, it uses `go tool trace` and a modified Go runtime.
Very impressive!

Then Alexey Palazhchenko talked about "profiling Go programs".
I remember one quote from Rob Pike, "fancy algorithms are slow when n is small, and n is usually small".
There were lots of talks mentioning garbage collection and latency!

From this point on, I was mentally preparing for our talk.
Finally at 17:00, Will and I had our talk!
We were introduced as "very special guests from the UK".
Clearly the UK is a highly desirable and respected place in the tech scene there!
Our talk went fairly smoothly, barring a technical glitch with the slide-clickamajig.
People asked lots of questions, some of which we didn’t know the answers to.
I don’t think they minded.

After the conference, we all went outside for pizza and beer - the universal software cuisine.
There was no vegan pizza so I had more beer instead.
This was the start of a long night of drinking and we both felt iffy on Saturday morning.
We recovered by going to "The Pub" - sweet familiarity.
A surprisingly faithful pub compared to most "Irish pubs".
Then we walked around Minsk.
It was very hot - my expectations of Russian weather were totally wrong
(although maybe don’t go in winter, when it often reaches minus 30 degrees).

In the post-conference chat, I spoke to people about [https://nats.io/](https://nats.io/).
It seems lots of Go people are using it.
It’s some kind of distributed/clustered messaging service implemented in Go.
It provides pub/sub, request/response, and queueing.
The protocol is text-based TCP.
In some respects it resembles Redis.
People were surprised we didn’t know about it.

On Saturday evening, we went to a festival:
["Rock Za Bobrov"](http://rock.bobrov.by/), which apparently translates as "Rock the Beaver".
It was at an airfield with lots of giant retired Soviet military planes and helicopters.
At the festival, Juno (the taxi company) had a very big exclusive VIP area -
an example of their prominence in Minsk.
Their VIP area had various outdoor games, free cocktails, and free fancy food.

At the festival, I met [Eugene Bolt](https://twitter.com/jekabolt),
a young programmer who also happens to be a [Vidrio](https://vidr.io/) user!
Apparently he first saw me in [this version of our Go GC talk which I made with Vidrio](https://www.youtube.com/watch?v=n59VtiRx34s).
The revolution is happening.
He seems quite creative: makes his own clothes, music, fonts, and other stuff.

Will and I had our return flight to Kiev at 07:00 on Sunday morning,
so we got about three hours sleep after the festival.
We had a 12-hour layover in Kiev, which we used to explore the city.
In contrast to the orderliness of Minsk, Kiev was more of a Wild West.
Still pretty touristy though - Ukraine might be at war but there’s no sign of that in Kiev.
The Dnieper runs wide through the city, and its banks are proper beaches -
many thousands of people sunbathing on sand.
Life is cheap in Kiev -
the metro costs 15p per journey, and we got a very nice italian meal for about £10/each.
