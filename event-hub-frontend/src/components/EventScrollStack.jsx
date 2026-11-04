import ScrollStack, { ScrollStackItem } from "./animations/ScrollStack";

const EventScrollStack = ({ useWindowScroll = true }) => {
  return (
    <ScrollStack
      useWindowScroll={useWindowScroll}
      itemScale={0.02}
      baseScale={0.92}
      blurAmount={0}
      rotationAmount={0}
    >

      {/* 1️⃣ MEETUPS – Bright Leaning */}
      <ScrollStackItem itemClassName="bg-gradient-to-br from-[#9ee3b5] via-[#5db5a6] to-[#3e797f] text-white">
        <CardContent
          title="Meetups"
          description="Community-driven gatherings to connect, share ideas, and grow together."
          image="https://d3eqn3hw2x95rk.cloudfront.net/gallery_main/2023-04-14.jpg"
        />
      </ScrollStackItem>

      {/* 2️⃣ WORKSHOPS – Still Bright but Deeper */}
      <ScrollStackItem itemClassName="bg-gradient-to-br from-[#5db5a6] via-[#3e797f] to-[#255156] text-white">
        <CardContent
          title="Workshops"
          description="Hands-on sessions designed to sharpen practical skills."
          image="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSR_MLXSswVTcLlGAAlCiw3CsOSF-A2jSytjA&s"
        />
      </ScrollStackItem>

      {/* 3️⃣ HACKATHONS – Transition to Dark */}
      <ScrollStackItem itemClassName="bg-gradient-to-br from-[#3e797f] via-[#255156] to-[#10242b] text-white">
        <CardContent
          title="Hackathons"
          description="High-energy coding marathons where ideas turn into real products."
          image="https://images.unsplash.com/photo-1559028012-481c04fa702d"
        />
      </ScrollStackItem>

      {/* 4️⃣ CONFERENCES – Dark Leaning */}
      <ScrollStackItem itemClassName="bg-gradient-to-br from-[#255156] via-[#10242b] to-[#0b181c] text-white">
        <CardContent
          title="Conferences"
          description="Large-scale events featuring keynotes, panels, and powerful networking."
          image="https://images.unsplash.com/photo-1505373877841-8d25f7d46678"
        />
      </ScrollStackItem>

    </ScrollStack>
  );
};

// Side-by-side on md+ (unchanged); stacked and centred on phones.
const CardContent = ({ title, description, image }) => {
  return (
    <div className="flex h-full flex-col md:flex-row items-center justify-between gap-6 md:gap-12 text-center md:text-left">

      {/* TEXT */}
      <div className="max-w-xl">
        <h2 className="text-3xl md:text-5xl font-bold mb-3 md:mb-6 tracking-tight">
          {title}
        </h2>

        <p className="text-base md:text-xl opacity-90 leading-relaxed">
          {description}
        </p>
      </div>

      {/* RECTANGULAR IMAGE */}
      <div className="relative w-full md:w-auto flex justify-center">
        <img
          src={image}
          alt={title}
          loading="lazy"
          decoding="async"
          className="
            w-full max-w-[500px]
            h-[180px] md:h-[260px]
            object-cover
            rounded-2xl
            shadow-2xl
          "
        />

        {/* subtle inner glow overlay */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-white/10 to-transparent pointer-events-none" />
      </div>

    </div>
  );
};

export default EventScrollStack;
