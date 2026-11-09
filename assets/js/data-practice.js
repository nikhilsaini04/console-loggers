import { MORE } from "./data-lang-more.js";
import { SHEETS, SD_MORE } from "./data-stack.js";
import { DOMAIN_SHEETS } from "./data-domains.js";
import { APTITUDE } from "./data-aptitude.js";
import { CS_SHEETS } from "./data-cs.js";
// Language practice sheets. Each exercise: [title, level] where level is B (basic), I (intermediate) or A (advanced).
// ["#", "Name"] starts a topic group. IDs are built from language + title, so renaming an exercise resets its tick.

export const LANGS = [
 { id: "java", name: "Java", tag: "Club core language",
   blurb: "Every club session is taught in Java. Finish this sheet before Step 5 of the DSA Sheet.",
   links: [
     ["Learn Java (official tutorials)", "https://dev.java/learn/"],
     ["Java SE API documentation", "https://docs.oracle.com/en/java/javase/21/docs/api/"],
     ["Java Collections overview", "https://docs.oracle.com/javase/tutorial/collections/"]
   ],
   items: [
    ["#","Basics"],
    ["Read two integers with Scanner and print their sum, difference, product and quotient","B"],
    ["Convert a temperature from Celsius to Fahrenheit","B"],["Swap two numbers with and without a third variable","B"],
    ["Find the area and perimeter of a rectangle and a circle","B"],["Show integer overflow with int and fix it with long","B"],
    ["#","Control flow"],
    ["Check whether a year is a leap year","B"],["Print the grade for a mark using if-else and then using switch","B"],
    ["Print the multiplication table of N","B"],["Find the sum of digits and reverse of a number","B"],
    ["Print all prime numbers between 1 and N","B"],["Print the first N Fibonacci numbers","B"],
    ["Build a menu-driven calculator that runs until the user chooses Exit","I"],
    ["#","Methods and arrays"],
    ["Write isPrime, factorial and gcd as static methods","B"],["Find the minimum, maximum and average of an array","B"],
    ["Reverse an array in place","B"],["Count even and odd elements in an array","B"],
    ["Add and multiply two matrices","I"],["Print the transpose of a matrix","I"],
    ["Write a method that uses varargs to add any number of integers","I"],
    ["#","Strings"],
    ["Count vowels, consonants, digits and spaces in a sentence","B"],["Check whether a string is a palindrome","B"],
    ["Show why == and equals() give different results for strings","B"],
    ["Reverse each word of a sentence using StringBuilder","I"],["Count the frequency of each character","I"],
    ["Compare the speed of String, StringBuilder and StringBuffer in a loop","I"],
    ["#","OOP"],
    ["Create a Student class with constructor, getters and setters","B"],["Create a BankAccount class with deposit, withdraw and balance checks","I"],
    ["Show method overloading and method overriding with a Shape example","I"],
    ["Use an abstract class Employee with FullTime and PartTime subclasses","I"],
    ["Use an interface Payable implemented by two unrelated classes","I"],
    ["Show the use of static, final and this in one program","I"],
    ["#","Collections"],
    ["Store and sort names in an ArrayList","B"],["Remove duplicates from a list using a HashSet","I"],
    ["Count word frequency in a paragraph with a HashMap","I"],["Sort students by marks with Comparable, then by name with Comparator","I"],
    ["Use a TreeMap to print words in alphabetical order with counts","I"],["Use ArrayDeque as both a stack and a queue","I"],
    ["#","Exceptions, files and more"],
    ["Handle ArithmeticException and ArrayIndexOutOfBoundsException","B"],["Create and throw a custom InsufficientBalanceException","I"],
    ["Write lines to a text file and read them back","I"],["Use try-with-resources to read a file","I"],
    ["Filter and map a list of numbers with streams and lambdas","A"],["Run two threads that print odd and even numbers in order","A"]
   ]},
 { id: "c", name: "C", tag: "Foundations",
   blurb: "Good for 1st year students who want to understand memory, pointers and how programs run.",
   links: [
     ["C reference (cppreference)", "https://en.cppreference.com/w/c"],
     ["GNU C Reference Manual", "https://www.gnu.org/software/gnu-c-manual/gnu-c-manual.html"]
   ],
   items: [
    ["#","Basics"],
    ["Print the size of each data type using sizeof","B"],["Read a character and print its ASCII value","B"],
    ["Find the largest of three numbers","B"],["Check whether a number is even or odd using the modulus operator and using bitwise AND","B"],
    ["#","Loops and functions"],
    ["Print a right-angled number triangle","B"],["Check whether a number is an Armstrong number","B"],
    ["Write a recursive function for factorial and power","B"],["Convert a decimal number to binary","I"],
    ["#","Arrays and strings"],
    ["Search an element with linear search","B"],["Sort an array with bubble sort","B"],
    ["Find the length of a string without strlen","B"],["Concatenate two strings without strcat","I"],["Count words in a sentence","I"],
    ["#","Pointers and memory"],
    ["Swap two numbers using pointers","B"],["Traverse an array using pointer arithmetic","I"],
    ["Allocate an array with malloc, fill it, then free it","I"],["Return multiple values from a function using pointers","I"],
    ["#","Structures and files"],
    ["Store and print details of N students using an array of structures","I"],
    ["Build a singly linked list with insert and display","A"],["Write records to a file and read them back","A"]
   ]},
 { id: "cpp", name: "C++", tag: "Competitive programming",
   blurb: "Common in contests because of the STL. Learn this after Java if you plan to do competitive programming.",
   links: [
     ["Learn C++", "https://www.learncpp.com/"],
     ["C++ reference (cppreference)", "https://en.cppreference.com/w/cpp"]
   ],
   items: [
    ["#","Basics"],
    ["Use cin and cout to read and print different data types","B"],["Use references to swap two numbers","B"],
    ["Write overloaded functions to find the area of different shapes","B"],["Use default arguments in a function","B"],
    ["#","OOP"],
    ["Create a class with a constructor, destructor and copy constructor","I"],["Overload the + operator for a Complex number class","I"],
    ["Show single, multilevel and multiple inheritance","I"],["Use virtual functions for runtime polymorphism","I"],
    ["Write a function template and a class template","I"],
    ["#","STL"],
    ["Sort a vector in ascending and descending order","B"],["Use a pair and sort a vector of pairs by second value","I"],
    ["Count frequencies with map and unordered_map","I"],["Remove duplicates using set","I"],
    ["Use stack and queue to reverse the first K elements of a queue","I"],
    ["Use priority_queue as a min-heap and a max-heap","I"],["Use lower_bound and upper_bound on a sorted vector","I"],
    ["#","Fast I/O and memory"],
    ["Set up fast I/O for competitive programming","B"],["Use new and delete for a dynamic array","I"],
    ["Use unique_ptr and shared_ptr instead of raw pointers","A"],["Write a lambda that captures a variable by reference","A"]
   ]},
 { id: "python", name: "Python", tag: "Scripting and data",
   blurb: "Useful for quick scripts, automation and data work. The syntax is short, so it's good for prototyping algorithms.",
   links: [
     ["The Python Tutorial (official)", "https://docs.python.org/3/tutorial/"],
     ["Python standard library", "https://docs.python.org/3/library/"]
   ],
   items: [
    ["#","Basics"],
    ["Take a name and age as input and print a greeting","B"],["Check whether a number is positive, negative or zero","B"],
    ["Print a pattern with nested for loops","B"],["Find the sum of a list without using sum()","B"],
    ["#","Data structures"],
    ["Use list slicing to reverse and rotate a list","B"],["Remove duplicates from a list while keeping order","I"],
    ["Count word frequency with a dictionary and with collections.Counter","I"],
    ["Use sets to find the common and unique elements of two lists","B"],["Create a list of squares using a list comprehension","B"],
    ["Sort a list of tuples by the second element","I"],
    ["#","Functions"],
    ["Write a function with default and keyword arguments","B"],["Use *args and **kwargs in a function","I"],
    ["Use map, filter and lambda on a list","I"],["Write a recursive function to flatten a nested list","I"],
    ["#","OOP, files and errors"],
    ["Create a class with __init__ and __str__","I"],["Use inheritance and super() in a pair of classes","I"],
    ["Read a CSV file and print the average of a column","I"],["Handle ValueError when converting input to int","B"],
    ["Write a generator that yields Fibonacci numbers","A"],["Write a decorator that times a function","A"]
   ]},
 { id: "js", name: "JavaScript", tag: "Web",
   blurb: "The language of the browser. Pair it with HTML and CSS to build your own projects and portfolio.",
   links: [
     ["MDN JavaScript Guide", "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide"],
     ["The Modern JavaScript Tutorial", "https://javascript.info/"]
   ],
   items: [
    ["#","Basics"],
    ["Show the difference between var, let and const","B"],["Show the difference between == and ===","B"],
    ["Write a function that returns the largest of three numbers","B"],["Use template literals to build a sentence","B"],
    ["#","Arrays and objects"],
    ["Use map, filter and reduce on an array of numbers","B"],["Find duplicates in an array using a Set","I"],
    ["Use destructuring and the spread operator with objects and arrays","I"],["Group an array of objects by a property","I"],
    ["Deep-copy a nested object and explain why spread is not enough","I"],
    ["#","Functions"],
    ["Write a closure that counts how many times it has been called","I"],["Explain this inside a normal function and an arrow function","I"],
    ["Write a debounce function","A"],
    ["#","DOM"],
    ["Change text and styles of an element on button click","B"],["Build a to-do list with add and delete","I"],
    ["Validate a form before submit","I"],["Save the to-do list in localStorage","I"],
    ["#","Async"],
    ["Use setTimeout to print messages in order","B"],["Write a function that returns a Promise and use .then","I"],
    ["Fetch data from a public API with async/await and show it on the page","I"],["Handle errors in async/await with try/catch","I"]
   ]}
];

export const PLATFORMS = [
  ["LeetCode", "https://leetcode.com/", "Interview-style problems. Every DSA Sheet link opens here."],
  ["HackerRank", "https://www.hackerrank.com/", "Language-specific tracks and certification tests."],
  ["GeeksforGeeks", "https://www.geeksforgeeks.org/", "Articles to read when a concept item needs explaining."],
  ["Codeforces", "https://codeforces.com/", "Timed contests for competitive programming."],
  ["CodeChef", "https://www.codechef.com/", "Monthly contests with problems for all levels."]
];

// Career tracks beyond DSA. Shown on the Practice page and linked from the home page.
export const TRACKS = [
  { id: "ai", name: "Artificial Intelligence",
    blurb: "Learn how AI systems search, reason and use language models, and how to build useful tools with them.",
    roadmap: ["Python, NumPy and basic probability", "Search, heuristics and classic AI problems", "Neural networks and how language models work", "Build a small project that uses an AI API"],
    links: [["Elements of AI (free course)", "https://www.elementsofai.com/"], ["Practical Deep Learning (fast.ai)", "https://course.fast.ai/"]] },
  { id: "ml", name: "Machine Learning",
    blurb: "Train models on real data and learn to judge whether they actually work.",
    roadmap: ["Linear algebra, statistics and Python data tools", "Regression, classification and clustering", "Train/test splits, metrics and overfitting", "Finish one end-to-end project on a public dataset"],
    links: [["Machine Learning Crash Course (Google)", "https://developers.google.com/machine-learning/crash-course"], ["Kaggle Learn", "https://www.kaggle.com/learn"], ["scikit-learn tutorials", "https://scikit-learn.org/stable/tutorial/index.html"]] },
  { id: "sd", name: "System Design",
    blurb: "Understand how large services are built so you can discuss trade-offs in design interviews.",
    roadmap: ["Client-server, HTTP and REST basics", "Databases: SQL vs NoSQL, indexing, replication", "Caching, load balancing, queues and sharding", "Practice designs: URL shortener, chat app, news feed"],
    links: [["The System Design Primer", "https://github.com/donnemartin/system-design-primer"], ["Amazon Builders' Library", "https://aws.amazon.com/builders-library/"]] },
  { id: "web", name: "Web Development",
    blurb: "Build and ship websites and web apps, starting from the basics of the browser.",
    roadmap: ["Semantic HTML and modern CSS layout", "JavaScript, the DOM and fetching data", "A front-end framework such as React", "Deploy a portfolio and two full projects"],
    links: [["MDN: Learn web development", "https://developer.mozilla.org/en-US/docs/Learn_web_development"], ["The Odin Project", "https://www.theodinproject.com/"], ["web.dev Learn", "https://web.dev/learn"]] },
  { id: "backend", name: "Java Backend",
    blurb: "Build server-side applications in Java, the language used in every club session.",
    roadmap: ["Core Java, collections and exceptions", "SQL and JDBC, then JPA and Hibernate", "REST APIs with Spring Boot, validation and testing", "Authentication, Docker and deploying a service"],
    links: [["Spring guides", "https://spring.io/guides"], ["Spring Boot documentation", "https://docs.spring.io/spring-boot/index.html"], ["PostgreSQL tutorial", "https://www.postgresql.org/docs/current/tutorial.html"]] }
];

// ── More language sheets (each topic group runs basic → advanced; groups are ordered by difficulty) ──
LANGS.push(
 { id: "ts", name: "TypeScript", group: "Languages", tag: "Typed JavaScript",
   blurb: "JavaScript with types. Most new front-end and Node.js projects use it, so learn it right after JavaScript.",
   links: [["TypeScript Handbook", "https://www.typescriptlang.org/docs/handbook/intro.html"], ["TypeScript Playground", "https://www.typescriptlang.org/play"]],
   items: [
    ["#","Basics"],
    ["Add type annotations to variables and function parameters","B"],["Use union types for a value that can be a string or a number","B"],
    ["Define an object shape with an interface","B"],["Use optional and readonly properties","B"],
    ["#","Types in practice"],
    ["Type an array of objects and filter it with full type safety","I"],["Use a type alias with a literal union such as 'easy' | 'medium' | 'hard'","I"],
    ["Narrow a union with typeof, in and discriminated unions","I"],["Write a generic function identity<T> and a generic Stack<T> class","I"],
    ["Type the response of a fetch call and handle errors","I"],["Use Partial, Pick, Omit and Record utility types","I"],
    ["#","Advanced"],
    ["Write a mapped type that makes every property optional and nullable","A"],["Use a conditional type with infer to get a function's return type","A"],
    ["Set up a small Node.js project with tsconfig and strict mode","A"],["Convert a 100-line JavaScript file to strict TypeScript","A"]
   ]},
 { id: "sql", name: "SQL", group: "Languages", tag: "Databases",
   blurb: "Every backend and data role uses SQL. Practice on a free PostgreSQL or SQLite database.",
   links: [["SQLBolt (interactive lessons)", "https://sqlbolt.com/"], ["PostgreSQL tutorial", "https://www.postgresql.org/docs/current/tutorial.html"], ["LeetCode SQL study plan", "https://leetcode.com/studyplan/top-sql-50/"]],
   items: [
    ["#","Basics"],
    ["Create a students table with suitable data types and a primary key","B"],["Insert, update and delete rows","B"],
    ["Select with WHERE, ORDER BY and LIMIT","B"],["Use LIKE, IN and BETWEEN in filters","B"],["Handle NULL values with IS NULL and COALESCE","B"],
    ["#","Aggregation and joins"],
    ["Count students per year with GROUP BY","B"],["Filter groups with HAVING","I"],["Join students and marks with INNER JOIN","I"],
    ["Find students with no marks using LEFT JOIN","I"],["Find the second-highest mark","I"],["Use a subquery in WHERE and in FROM","I"],
    ["#","Design"],
    ["Normalize a single wide table into 3NF","I"],["Add foreign keys and choose ON DELETE behavior","I"],["Create an index and compare query plans with EXPLAIN","A"],
    ["#","Advanced"],
    ["Rank students within each year using window functions","A"],["Compute a running total with SUM() OVER","A"],
    ["Write a recursive CTE to walk a hierarchy","A"],["Use a transaction to transfer marks or money safely","A"]
   ]},
 { id: "csharp", name: "C#", group: "Languages", tag: ".NET",
   blurb: "Used for enterprise back ends, desktop apps and game development with Unity. Close to Java, so it's quick to pick up.",
   links: [["C# documentation (Microsoft Learn)", "https://learn.microsoft.com/en-us/dotnet/csharp/"], ["C# tour", "https://learn.microsoft.com/en-us/dotnet/csharp/tour-of-csharp/"]],
   items: [
    ["#","Basics"],
    ["Read input with Console.ReadLine and parse numbers","B"],["Use string interpolation and formatting","B"],
    ["Write methods with ref, out and optional parameters","B"],["Use arrays, List<T> and foreach","B"],
    ["#","OOP"],
    ["Create a class with properties and a constructor","B"],["Use inheritance, virtual and override","I"],["Implement an interface for two classes","I"],
    ["Compare a struct and a class with a small example","I"],["Use records for immutable data","I"],
    ["#","Collections and LINQ"],
    ["Count word frequency with Dictionary<string, int>","I"],["Filter, sort and group a list with LINQ","I"],["Handle exceptions with try, catch and finally","I"],
    ["#","Advanced"],
    ["Call a web API with HttpClient using async and await","A"],["Use delegates and events for a simple notifier","A"],
    ["Build a minimal Web API with ASP.NET Core","A"]
   ]},
 { id: "go", name: "Go", group: "Languages", tag: "Cloud and services",
   blurb: "A small, fast language used for cloud tools and back-end services. Known for simple concurrency.",
   links: [["A Tour of Go", "https://go.dev/tour/"], ["Go by Example", "https://gobyexample.com/"], ["Effective Go", "https://go.dev/doc/effective_go"]],
   items: [
    ["#","Basics"],
    ["Print a formatted table with fmt.Printf","B"],["Use if, for and switch (Go has no while loop)","B"],
    ["Write a function that returns a value and an error","B"],["Use slices: append, copy and slicing","B"],["Count words with a map","B"],
    ["#","Types"],
    ["Define a struct with methods","I"],["Use pointer receivers to change a struct","I"],["Implement the Stringer interface","I"],
    ["Write a custom error type and check it with errors.As","I"],
    ["#","Concurrency"],
    ["Start goroutines and wait for them with sync.WaitGroup","I"],["Send results through a channel","I"],
    ["Build a worker pool that processes jobs in parallel","A"],["Use select with a timeout","A"],["Protect a shared counter with sync.Mutex","A"],
    ["#","Projects"],
    ["Write table-driven tests with the testing package","A"],["Build a JSON REST API with net/http","A"]
   ]},
 { id: "rust", name: "Rust", group: "Languages", tag: "Systems and safety",
   blurb: "Memory-safe systems programming without a garbage collector. Harder to start, but it teaches you how memory really works.",
   links: [["The Rust Programming Language (book)", "https://doc.rust-lang.org/book/"], ["Rustlings exercises", "https://github.com/rust-lang/rustlings"], ["Rust by Example", "https://doc.rust-lang.org/rust-by-example/"]],
   items: [
    ["#","Basics"],
    ["Create a project with cargo and run it","B"],["Use let, mut and shadowing","B"],["Write a function with loops and if expressions","B"],
    ["#","Ownership"],
    ["Show a move, then fix it with a clone or a borrow","I"],["Write a function that takes &str and one that takes &mut String","I"],
    ["Return the first word of a string using a slice","I"],
    ["#","Types and errors"],
    ["Model a shape with an enum and use match","I"],["Use Option to handle a missing value","I"],["Use Result and the ? operator to read a file","I"],
    ["Store and update scores in a HashMap","I"],
    ["#","Advanced"],
    ["Define a trait and implement it for two structs","A"],["Write a generic function with a trait bound","A"],
    ["Fix a lifetime error in a function returning a reference","A"],["Use iterators: map, filter and collect","A"],["Share data between threads with Arc and Mutex","A"]
   ]},
 { id: "kotlin", name: "Kotlin", group: "Languages", tag: "Android",
   blurb: "The main language for Android apps. It runs on the JVM, so Java students can learn it quickly.",
   links: [["Kotlin documentation", "https://kotlinlang.org/docs/home.html"], ["Kotlin Koans (exercises)", "https://play.kotlinlang.org/koans/overview"]],
   items: [
    ["#","Basics"],
    ["Use val and var, and string templates","B"],["Write a function with default and named arguments","B"],
    ["Use when as a replacement for switch","B"],["Loop over ranges and collections","B"],
    ["#","Null safety and classes"],
    ["Handle nullable types with ?., ?: and let","I"],["Create a data class and use copy()","I"],["Use an object for a singleton","I"],
    ["Model results with a sealed class","I"],
    ["#","Collections and functions"],
    ["Use filter, map, groupBy and sortedBy on a list","I"],["Write an extension function on String","I"],["Pass a lambda to a higher-order function","I"],
    ["#","Advanced"],
    ["Run two tasks at once with coroutines","A"],["Use a Flow to emit a stream of values","A"],["Call Kotlin code from Java and Java code from Kotlin","A"]
   ]},
 { id: "php", name: "PHP", group: "Languages", tag: "Server-side web",
   blurb: "Still runs most of the web's server-side code, including WordPress and Laravel sites.",
   links: [["PHP manual", "https://www.php.net/manual/en/"], ["PHP: The Right Way", "https://phptherightway.com/"]],
   items: [
    ["#","Basics"],
    ["Print variables with echo and string interpolation","B"],["Use indexed and associative arrays","B"],
    ["Write functions with type declarations","B"],["Loop with foreach over an associative array","B"],
    ["#","Web"],
    ["Read form input with $_POST and validate it","I"],["Escape output with htmlspecialchars to prevent XSS","I"],
    ["Use sessions to keep a user logged in","I"],["Connect to MySQL with PDO and use prepared statements","I"],
    ["#","OOP and tools"],
    ["Create classes with constructor property promotion","I"],["Use interfaces and namespaces","I"],["Install a package with Composer and autoload it","A"],
    ["Build a small CRUD app with routing","A"]
   ]},
 { id: "bash", name: "Bash & Linux", group: "Languages", tag: "Command line",
   blurb: "Every developer uses the terminal. Servers, Git and deployment all depend on it.",
   links: [["The Linux Command Line (free book)", "https://linuxcommand.org/tlcl.php"], ["GNU Bash manual", "https://www.gnu.org/software/bash/manual/"]],
   items: [
    ["#","Basics"],
    ["Navigate with pwd, ls, cd and use absolute and relative paths","B"],["Create, copy, move and delete files and folders","B"],
    ["View files with cat, less, head and tail","B"],["Change file permissions with chmod","B"],
    ["#","Text processing"],
    ["Search text with grep and regular expressions","I"],["Count lines and words with wc, sort and uniq","I"],
    ["Chain commands with pipes and redirect output","I"],["Extract columns with cut and awk","I"],
    ["#","Scripting"],
    ["Write a script with variables, if and for","I"],["Read script arguments with $1 and $@","I"],
    ["Write a script that backs up a folder with a date in the name","A"],["Schedule a script with cron","A"],["Find and kill a process using ps and kill","A"]
   ]}
);
LANGS.forEach(L => { if (!L.group) L.group = "Languages"; });

// ── System design tracker ──
LANGS.push({
  id: "sysdesign", name: "System Design", group: "Engineering", tag: "Interviews for SDE roles",
  blurb: "Concepts first, then low-level design, then full system designs. For each design, write the requirements, API, data model and a diagram, then discuss trade-offs.",
  links: [["The System Design Primer", "https://github.com/donnemartin/system-design-primer"], ["Amazon Builders' Library", "https://aws.amazon.com/builders-library/"], ["roadmap.sh: System Design", "https://roadmap.sh/system-design"]],
  items: [
   ["#","Foundations"],
   ["Client-server model and what happens when you type a URL","B"],["HTTP methods, status codes and REST API design","B"],
   ["Latency vs throughput, and back-of-the-envelope estimates","B"],["Vertical vs horizontal scaling","B"],["SQL vs NoSQL: when to use each","B"],
   ["DNS and CDNs","B"],
   ["#","Building blocks"],
   ["Load balancers and reverse proxies","I"],["Caching: cache-aside, write-through, eviction policies","I"],["Database indexing","I"],
   ["Replication: leader-follower and multi-leader","I"],["Sharding and partitioning strategies","I"],["Message queues and pub/sub","I"],
   ["API styles: REST, GraphQL and gRPC","I"],["Monolith vs microservices","I"],["Authentication with sessions, JWT and OAuth","I"],
   ["#","Distributed systems"],
   ["CAP theorem and consistency models","A"],["Consistent hashing","A"],["Rate limiting algorithms: token bucket and sliding window","A"],
   ["Idempotency and retries","A"],["Event-driven architecture and event sourcing","A"],["Observability: logs, metrics and tracing","A"],
   ["Leader election and consensus at a high level","A"],
   ["#","Low-level design (object-oriented)"],
   ["SOLID principles with Java examples","B"],["Design patterns: Singleton, Factory, Strategy, Observer","I"],
   ["Design a parking lot","I"],["Design a library management system","I"],["Design a vending machine","I"],["Design an LRU cache class","I"],
   ["Design a snake and ladder game","I"],["Design an elevator system","A"],["Design a splitwise-style expense sharer","A"],
   ["#","High-level design problems"],
   ["Design a URL shortener","I"],["Design a pastebin","I"],["Design a rate limiter","I"],["Design a notification service","I"],
   ["Design a chat app","A"],["Design a news feed","A"],["Design a video streaming service","A"],["Design a ride-hailing service","A"],
   ["Design a web crawler","A"],["Design a distributed key-value store","A"],["Design a search autocomplete system","A"]
  ]
});

// Extra study resources, grouped. Shown on the Practice page.
export const RESOURCES = [
  { name: "Courses", items: [
    ["CS50x (Harvard)", "https://cs50.harvard.edu/x/", "Free introduction to computer science and programming."],
    ["MIT 6.006 Introduction to Algorithms", "https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/", "Full university algorithms course with lectures and problem sets."],
    ["NPTEL", "https://nptel.ac.in/", "Free IIT and IISc courses on programming, DSA and more."],
    ["roadmap.sh", "https://roadmap.sh/", "Step-by-step learning roadmaps for every developer role."]]},
  { name: "Algorithm references", items: [
    ["cp-algorithms", "https://cp-algorithms.com/", "Clear explanations of algorithms used in competitive programming."],
    ["VisuAlgo", "https://visualgo.net/", "Animated visualizations of sorting, trees, graphs and more."],
    ["USACO Guide", "https://usaco.guide/", "Free, structured guide to competitive programming topics by level."],
    ["Big-O of common operations", "https://www.bigocheatsheet.com/", "Quick reference for time and space complexity."]]},
  { name: "More practice", items: [
    ["CSES Problem Set", "https://cses.fi/problemset/", "300+ classic problems grouped by topic."],
    ["AtCoder", "https://atcoder.jp/", "Weekly contests with clean, well-tested problems. Beginner Contests are a good start."],
    ["Exercism", "https://exercism.org/", "Free language exercises with mentor feedback for 70+ languages."],
    ["HackerEarth", "https://www.hackerearth.com/", "Practice problems and hiring challenges from companies."]]},
  { name: "Interview preparation", items: [
    ["Tech Interview Handbook", "https://www.techinterviewhandbook.org/", "Free guide to coding interviews, resumes and behavioral rounds."],
    ["Books to read", "", "Introduction to Algorithms (CLRS) · Designing Data-Intensive Applications · Clean Code · Head First Design Patterns."]]}
];

// Merge the extra exercises into each language sheet, add the Java-stack and interview sheets,
// and extend the system design tracker. System design stays last.
LANGS.forEach(L => { if (MORE[L.id]) L.items = L.items.concat(MORE[L.id]); });
{
  const sd = LANGS.find(L => L.id === "sysdesign");
  sd.items = sd.items.concat(SD_MORE);
  LANGS.splice(LANGS.indexOf(sd), 0, ...SHEETS);
  // Collections sits right after Java 8+ in the Java stack.
  const coll = DOMAIN_SHEETS.find(s => s.id === "collections");
  LANGS.splice(LANGS.findIndex(L => L.id === "java8") + 1, 0, coll);
  LANGS.push(...CS_SHEETS, ...DOMAIN_SHEETS.filter(s => s !== coll), ...APTITUDE);
  const ORDER = ["Languages", "Java stack", "CS fundamentals", "Domains", "Aptitude", "Interview prep", "Engineering"];
  const pos = new Map(LANGS.map((L, i) => [L, i]));
  LANGS.sort((a, b) => (ORDER.indexOf(a.group) - ORDER.indexOf(b.group)) || (pos.get(a) - pos.get(b)));
}
