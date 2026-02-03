NAVIGATION_MAP = {
    # Project pages
    "seeds": "http://localhost:5173/seeds",
    "seed": "http://localhost:5173/seeds",
    "buy seeds": "http://localhost:5173/seeds",
    "purchase seeds": "http://localhost:5173/seeds",
    "seed shop": "http://localhost:5173/seeds",
    "seed marketplace": "http://localhost:5173/seeds",
    "seed catalog": "http://localhost:5173/seeds",
    "seed catalogue": "http://localhost:5173/seeds",
    "tea": "http://localhost:5173/tea",
    "tea farming": "http://localhost:5173/tea",
    "tea cultivation": "http://localhost:5173/tea",
    "tea guide": "http://localhost:5173/tea",
    "tea pruning": "http://localhost:5173/tea",
    "tea diseases": "http://localhost:5173/tea",
    "tea info": "http://localhost:5173/tea",
    "iot": "http://localhost:5173/sensors-iot",
    "sensors": "http://localhost:5173/sensors-iot",
    "sensor": "http://localhost:5173/sensors-iot",
    "iot sensors": "http://localhost:5173/sensors-iot",
    "sensor iot": "http://localhost:5173/sensors-iot",
    "farm sensors": "http://localhost:5173/sensors-iot",
    "sensor data": "http://localhost:5173/sensors-iot",
    "device monitoring": "http://localhost:5173/sensors-iot",
    "schemes": "http://localhost:5173/schemes",
    "government schemes": "http://localhost:5173/schemes",
    "gov schemes": "http://localhost:5173/schemes",
    "farmer schemes": "http://localhost:5173/schemes",
    "subsidy": "http://localhost:5173/schemes",
    "subsidies": "http://localhost:5173/schemes",
    "pm kisan": "http://localhost:5173/schemes",
    "fertilizer subsidy": "http://localhost:5173/schemes",
    "agri schemes": "http://localhost:5173/schemes",

    # Apps
    "chatbot": "http://localhost:5175/",
    "chat": "http://localhost:5175/",
    "assistant": "http://localhost:5175/",
    "help": "http://localhost:5175/",
    "support": "http://localhost:5175/",
    "research": "https://sahaya-kissan-research.vercel.app/",
    "research portal": "https://sahaya-kissan-research.vercel.app/",
    "studies": "https://sahaya-kissan-research.vercel.app/",
    "papers": "https://sahaya-kissan-research.vercel.app/",
    "agri research": "https://sahaya-kissan-research.vercel.app/",
    "tea research": "https://sahaya-kissan-research.vercel.app/",
}

def detect_navigation_intent(user_message: str):
    msg = user_message.lower()

    for keyword, url in NAVIGATION_MAP.items():
        if keyword in msg:
            return {
                "type": "NAVIGATION",
                "url": url,
                "label": f"Open {keyword.title()}"
            }

    return None
