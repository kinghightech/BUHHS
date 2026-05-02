import { useState, useEffect, useCallback, useRef } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Icon from '../components/Icon'

// ─── Scenario data ──────────────────────────────────────────────────────────

const SCENARIOS = [
  {
    id: 'earthquake',
    name: 'Earthquake',
    icon: 'zap',
    color: '#f59e0b',
    bg: 'linear-gradient(135deg, #78350f 0%, #92400e 50%, #451a03 100%)',
    desc: 'A 6.5 magnitude earthquake strikes. The ground is shaking violently. You have seconds to act.',
    steps: [
      {
        text: 'The building begins to shake. Dishes rattle, lights flicker. What do you do?',
        options: [
          { label: 'Drop, cover, and hold under a sturdy table', score: 100, feedback: 'Excellent! Drop, Cover, Hold is the recommended response. You protected yourself from falling debris.' },
          { label: 'Run outside immediately', score: 30, feedback: 'Running during shaking is dangerous — falling objects and broken glass cause most earthquake injuries.' },
          { label: 'Stand in a doorway', score: 50, feedback: 'This is a common myth. Modern doorways aren\'t stronger than other parts of the building. Drop, Cover, Hold is safer.' },
        ],
      },
      {
        text: 'The shaking stops. You smell gas. What\'s your next move?',
        options: [
          { label: 'Open windows, don\'t use switches, evacuate', score: 100, feedback: 'Correct! Gas leaks are a major post-earthquake hazard. You avoided an explosion risk.' },
          { label: 'Turn on lights to check for damage', score: 10, feedback: 'Dangerous! Electrical sparks can ignite a gas leak. Never flip switches if you smell gas.' },
          { label: 'Ignore it and start cleaning up', score: 20, feedback: 'Gas leaks can cause explosions. Always address gas smells before anything else.' },
        ],
      },
      {
        text: 'You\'ve evacuated safely. An aftershock warning is issued. Where do you go?',
        options: [
          { label: 'Open area away from buildings and power lines', score: 100, feedback: 'Perfect! Open areas are safest during aftershocks. You avoided structural collapse risk.' },
          { label: 'Back inside to grab valuables', score: 10, feedback: 'Extremely dangerous! Aftershocks can cause already-weakened structures to collapse.' },
          { label: 'Under a highway overpass', score: 20, feedback: 'Overpasses are dangerous during earthquakes — they can collapse. Stay in open areas.' },
        ],
      },
      {
        text: 'You notice cracks forming in the walls of a nearby building. People are still inside. What do you do?',
        options: [
          { label: 'Alert people from a safe distance and call emergency services', score: 100, feedback: 'Right call! Warn others without putting yourself at risk. Let trained rescuers handle structural dangers.' },
          { label: 'Run inside to help evacuate people', score: 40, feedback: 'Your bravery is admirable, but entering a structurally compromised building risks your life too. Call 911 instead.' },
          { label: 'Walk away — it\'s not your problem', score: 20, feedback: 'Ignoring people in danger is risky morally and practically. A quick warning from a safe distance could save lives.' },
        ],
      },
      {
        text: 'Water from the faucet looks cloudy after the earthquake. What should you do?',
        options: [
          { label: 'Don\'t drink it — use bottled or boiled water until authorities confirm safety', score: 100, feedback: 'Correct! Earthquakes can rupture water mains and contaminate supplies. Always wait for an official all-clear.' },
          { label: 'Let it run for a minute then drink it', score: 30, feedback: 'Cloudy water after an earthquake may be contaminated with bacteria or chemicals. Running it won\'t fix that.' },
          { label: 'Drink it — it\'s probably fine', score: 10, feedback: 'Contaminated water can cause serious illness. Never assume it\'s safe after a natural disaster.' },
        ],
      },
      {
        text: 'Your neighbor is trapped under a heavy bookshelf. They\'re conscious and breathing. What do you do?',
        options: [
          { label: 'Stabilize the shelf so it won\'t shift further, then call for help', score: 100, feedback: 'Good thinking! Prevent further injury while getting professional rescuers on the way.' },
          { label: 'Try to lift the bookshelf off by yourself', score: 50, feedback: 'You could injure yourself or cause the shelf to shift and hurt them more. Get help first if possible.' },
          { label: 'Leave them and evacuate — aftershocks might come', score: 20, feedback: 'Abandoning an injured person is dangerous for them. At minimum, call 911 before leaving.' },
        ],
      },
      {
        text: 'The power is out across the neighborhood. How do you light your home safely?',
        options: [
          { label: 'Use flashlights or battery-powered lanterns', score: 100, feedback: 'Safest option! No fire risk and no carbon monoxide. Always keep spare batteries in your emergency kit.' },
          { label: 'Light candles throughout the house', score: 40, feedback: 'Candles are a fire hazard, especially in a structurally damaged home. Use battery lights instead.' },
          { label: 'Run the gas generator inside the garage', score: 10, feedback: 'Extremely dangerous! Generators produce carbon monoxide. Never run them indoors or in enclosed spaces.' },
        ],
      },
      {
        text: 'You feel a strong aftershock while driving. What should you do?',
        options: [
          { label: 'Pull over away from overpasses and bridges, stay in the car', score: 100, feedback: 'Correct! Your car provides protection from falling debris. Avoid structures that could collapse.' },
          { label: 'Speed up to get off the road faster', score: 20, feedback: 'Speeding during an aftershock is dangerous. The road may be cracked or obstructed.' },
          { label: 'Stop directly under an overpass for shelter', score: 15, feedback: 'Overpasses are extremely dangerous during earthquakes. They can pancake-collapse.' },
        ],
      },
      {
        text: 'Emergency services say your building is "yellow-tagged" (restricted use). What does this mean?',
        options: [
          { label: 'Enter briefly for essentials only — structural damage is present', score: 100, feedback: 'Correct! Yellow-tagged means limited entry. Grab necessities quickly and don\'t stay.' },
          { label: 'It\'s safe to live in — just cosmetic damage', score: 10, feedback: 'Wrong! Yellow means real structural concerns. Living there is unsafe until repairs are inspected.' },
          { label: 'The building will be demolished', score: 30, feedback: 'That\'s red-tagged. Yellow means it may be repairable but is unsafe for normal occupancy right now.' },
        ],
      },
      {
        text: 'It\'s been 48 hours since the earthquake. What should be your financial priority?',
        options: [
          { label: 'Document all damage with photos and contact your insurance company', score: 100, feedback: 'Essential! Early documentation strengthens claims. The average earthquake claim takes 30-60 days to process.' },
          { label: 'Start repairs immediately to prevent further damage', score: 50, feedback: 'Preventing further damage is good, but document FIRST. Without evidence, your claim could be denied.' },
          { label: 'Wait for things to settle down before dealing with paperwork', score: 20, feedback: 'Delays can hurt your claim. Many policies have strict reporting deadlines after a disaster.' },
        ],
      },
    ],
    financialInsight: 'Average earthquake damage to a residential home: $30,000–$150,000. Only 12% of homeowners have earthquake insurance.',
  },
  {
    id: 'flood',
    name: 'Flood',
    icon: 'waves',
    color: '#3b82f6',
    bg: 'linear-gradient(135deg, #1e3a5f 0%, #1e40af 50%, #0c1e3e 100%)',
    desc: 'Flash flood warnings issued. Water is rising rapidly in your neighborhood. Time is critical.',
    steps: [
      {
        text: 'Water is entering your street. It\'s 6 inches deep and rising fast. What do you do?',
        options: [
          { label: 'Move important documents and electronics upstairs', score: 90, feedback: 'Smart! Elevating valuables reduces financial loss. Average flood claim: $42,000.' },
          { label: 'Drive through the flooded street to evacuate', score: 10, feedback: 'Never drive through floodwater! Just 12 inches can sweep away a car. "Turn Around, Don\'t Drown."' },
          { label: 'Wait and see if the water recedes', score: 30, feedback: 'Flash floods can rise feet in minutes. Don\'t wait — take action immediately.' },
        ],
      },
      {
        text: 'Water reaches 2 feet outside. Evacuation is ordered. How do you leave?',
        options: [
          { label: 'Walk through floodwater to higher ground', score: 60, feedback: 'Walking is safer than driving, but 6 inches of moving water can knock you down. Use caution and avoid currents.' },
          { label: 'Go to the highest floor and call for rescue', score: 100, feedback: 'Best choice when water is this high. Going vertical keeps you safe while rescue teams mobilize.' },
          { label: 'Swim to the neighbor\'s two-story house', score: 20, feedback: 'Floodwater contains debris, chemicals, and strong currents. Swimming is extremely dangerous.' },
        ],
      },
      {
        text: 'The flood recedes after 8 hours. You return home. What\'s your first priority?',
        options: [
          { label: 'Document damage with photos before cleaning', score: 100, feedback: 'Essential for insurance claims! Thorough documentation can increase your settlement by 30-50%.' },
          { label: 'Start removing water and damaged items', score: 50, feedback: 'Cleanup is important but always document first. Without photos, insurance claims are much harder.' },
          { label: 'Turn on the power to check electrical systems', score: 10, feedback: 'Never turn on power in a flooded home — electrocution risk. Have a professional inspect first.' },
        ],
      },
      {
        text: 'You\'re driving and encounter a flooded road. The water looks shallow. What do you do?',
        options: [
          { label: 'Turn around and find an alternate route', score: 100, feedback: 'Perfect! You can\'t judge water depth by looking. Just 6 inches of moving water can stall your engine.' },
          { label: 'Drive through slowly in a low gear', score: 30, feedback: 'Risky! Even shallow-looking water can hide washouts, debris, and be much deeper than it appears.' },
          { label: 'Follow the car ahead of you through', score: 20, feedback: 'Just because one car made it doesn\'t mean yours will. Conditions change rapidly in floodwater.' },
        ],
      },
      {
        text: 'You\'re trapped on the second floor. Water is still rising. Your phone has 5% battery. What do you do?',
        options: [
          { label: 'Call 911, give exact location, then text family your address', score: 100, feedback: 'Correct! Calling 911 first is critical. Texts use less battery than calls for follow-ups.' },
          { label: 'Post on social media asking for help', score: 30, feedback: 'Social media is unreliable for emergency rescue. Always call 911 first with your remaining battery.' },
          { label: 'Save battery and wait — someone will come', score: 20, feedback: 'Rescuers won\'t know you need help unless you contact them. Use that battery wisely on 911.' },
        ],
      },
      {
        text: 'After the flood, your basement has 3 feet of standing water. How do you remove it?',
        options: [
          { label: 'Pump it out gradually over several days', score: 100, feedback: 'Correct! Removing water too quickly can cause walls to collapse from external soil pressure. Slow and steady.' },
          { label: 'Pump it all out as fast as possible', score: 30, feedback: 'Rapid drainage creates uneven pressure on basement walls. Pump about 1/3 per day to prevent collapse.' },
          { label: 'Let it drain naturally', score: 20, feedback: 'Standing water breeds mold within 24-48 hours and weakens the foundation. Active pumping is needed.' },
        ],
      },
      {
        text: 'You find mold growing on walls 3 days after the flood. What\'s the safest response?',
        options: [
          { label: 'Wear an N95 mask and gloves, clean with bleach solution on hard surfaces', score: 100, feedback: 'Correct approach for small areas. For areas larger than 10 sq ft, hire a professional mold remediation service.' },
          { label: 'Paint over it to seal it in', score: 10, feedback: 'Painting over mold doesn\'t kill it — it continues growing underneath and can cause respiratory illness.' },
          { label: 'Open windows and let it air out', score: 30, feedback: 'Ventilation helps but won\'t eliminate mold. Active cleaning is needed within 24-48 hours.' },
        ],
      },
      {
        text: 'Your flood insurance claim is denied because they say the damage was "pre-existing." What should you do?',
        options: [
          { label: 'Appeal with your documented photos, receipts, and a public adjuster', score: 100, feedback: 'Right move! Documented evidence and a public adjuster can overturn denials. 50% of appealed claims get increased payouts.' },
          { label: 'Accept the denial — insurance companies are always right', score: 10, feedback: 'Insurance denials can be wrong. Always appeal with evidence. You have the right to dispute.' },
          { label: 'Threaten to sue immediately', score: 30, feedback: 'Legal action is a last resort. Start with a formal appeal and public adjuster — it\'s faster and cheaper.' },
        ],
      },
      {
        text: 'Authorities say tap water may be contaminated after the flood. How do you get safe drinking water?',
        options: [
          { label: 'Use bottled water or boil tap water for at least 1 minute', score: 100, feedback: 'Correct! Boiling kills most pathogens. Continue until authorities issue an official all-clear.' },
          { label: 'Run the tap until it looks clear', score: 20, feedback: 'Clear-looking water can still contain harmful bacteria and chemicals from flood contamination.' },
          { label: 'Filter it through a coffee filter', score: 15, feedback: 'Coffee filters remove sediment but NOT bacteria, viruses, or chemical contaminants.' },
        ],
      },
      {
        text: 'Your car was submerged in 4 feet of floodwater but looks fine externally. What do you do?',
        options: [
          { label: 'Do NOT start it — have it towed to a mechanic for inspection', score: 100, feedback: 'Correct! Starting a flooded car can destroy the engine. Water in the cylinders causes hydro-lock.' },
          { label: 'Try starting it to see if it works', score: 10, feedback: 'Starting a flooded engine can cause catastrophic damage costing $5,000-$10,000. Always get it inspected first.' },
          { label: 'Let it dry out in the sun for a few days then try', score: 30, feedback: 'Drying helps, but water corrodes electrical systems invisibly. Professional inspection is essential.' },
        ],
      },
    ],
    financialInsight: 'Average flood claim payout: $42,000. Standard homeowner insurance does NOT cover floods — a separate NFIP policy is required.',
  },
  {
    id: 'wildfire',
    name: 'Wildfire',
    icon: 'flame',
    color: '#ef4444',
    bg: 'linear-gradient(135deg, #7f1d1d 0%, #b91c1c 50%, #450a0a 100%)',
    desc: 'A wildfire is advancing toward your area. Smoke fills the sky. Evacuation may be imminent.',
    steps: [
      {
        text: 'Fire is reported 5 miles away, moving toward you. No evacuation order yet. What do you do?',
        options: [
          { label: 'Start packing go-bags, create defensible space around home', score: 100, feedback: 'Proactive preparation is key! Creating defensible space can save your home even if fire reaches your area.' },
          { label: 'Wait for official evacuation order', score: 40, feedback: 'Wildfires move unpredictably. Early preparation can mean the difference between a 10-minute organized exit and a panicked escape.' },
          { label: 'Start hosing down the roof and yard', score: 60, feedback: 'Water can help, but clearing combustible materials (dead leaves, furniture) is more effective. Time is better spent preparing to evacuate.' },
        ],
      },
      {
        text: 'Evacuation ordered. You have 15 minutes. What do you grab?',
        options: [
          { label: 'Pre-packed go-bag: documents, meds, phone charger, water', score: 100, feedback: 'Perfect! A pre-packed go-bag saves critical minutes. Having documents speeds up insurance claims by weeks.' },
          { label: 'TV, gaming console, and expensive electronics', score: 20, feedback: 'Electronics can be replaced — your life can\'t. Focus on irreplaceable items: documents, medications, photos.' },
          { label: 'Try to load furniture into a truck', score: 10, feedback: 'Furniture costs time that could save your life. Average wildfire can advance 14 mph. Evacuate immediately.' },
        ],
      },
      {
        text: 'You\'re driving on the evacuation route. Heavy smoke reduces visibility to 50 feet. What do you do?',
        options: [
          { label: 'Drive slowly with headlights on, windows up, recirculate air', score: 100, feedback: 'Correct! Close all vents, recirculate air, drive slowly. Smoke inhalation is the #1 cause of wildfire deaths.' },
          { label: 'Speed up to get through the smoke faster', score: 20, feedback: 'Speeding in low visibility causes crashes. Other evacuees and emergency vehicles share the road.' },
          { label: 'Stop and wait for smoke to clear', score: 30, feedback: 'Stopping in a fire zone is dangerous — fire can overtake you. Keep moving toward safety.' },
        ],
      },
      {
        text: 'Your evacuation route is blocked by a downed tree on fire. What do you do?',
        options: [
          { label: 'Turn around and take an alternate route — check GPS or radio for updates', score: 100, feedback: 'Correct! Never try to pass through fire. Use navigation apps or emergency radio for alternate routes.' },
          { label: 'Drive through the gap next to the tree', score: 10, feedback: 'Extremely dangerous! Burning trees can fall, and heat can ignite your car\'s fuel. Find another route.' },
          { label: 'Get out and try to move the tree', score: 10, feedback: 'A burning tree is lethal. Stay in your vehicle and find another way. Your car provides some protection.' },
        ],
      },
      {
        text: 'You\'re creating defensible space around your home before fire season. What\'s the most effective action?',
        options: [
          { label: 'Clear dead vegetation, leaves, and debris within 30 feet of the house', score: 100, feedback: 'This is Zone 1 — the most critical area. Homes with defensible space are 3x more likely to survive a wildfire.' },
          { label: 'Paint the house with fire-resistant paint', score: 40, feedback: 'Fire-resistant materials help, but clearing vegetation is far more impactful. Embers ignite ground fuel first.' },
          { label: 'Install a sprinkler system on the roof', score: 50, feedback: 'Roof sprinklers can help, but they need water pressure. Clearing vegetation is more reliable and effective.' },
        ],
      },
      {
        text: 'Smoke from a nearby wildfire is affecting air quality. The AQI is 250 (Very Unhealthy). What should you do?',
        options: [
          { label: 'Stay indoors, close windows, use an air purifier or HVAC with good filters', score: 100, feedback: 'Correct! At AQI 250+, everyone should limit outdoor exposure. N95 masks help if you must go outside.' },
          { label: 'Wear a cloth face mask if you go outside', score: 30, feedback: 'Cloth masks don\'t filter fine particulate matter (PM2.5) from smoke. You need an N95 respirator.' },
          { label: 'Exercise indoors with windows open for fresh air', score: 10, feedback: 'Opening windows lets smoke in! Keep everything sealed. Exercise increases breathing rate and smoke intake.' },
        ],
      },
      {
        text: 'You return home after the fire passed. The structure is standing but scorched. What\'s your first step?',
        options: [
          { label: 'Wait for fire department to declare it safe before entering', score: 100, feedback: 'Correct! Hotspots, structural damage, and toxic ash make re-entry dangerous. Let professionals clear it first.' },
          { label: 'Go inside immediately to check on belongings', score: 10, feedback: 'Dangerous! Hidden hotspots can reignite, and ash contains toxic chemicals. Wait for official clearance.' },
          { label: 'Spray down the exterior with a garden hose', score: 40, feedback: 'Cooling hotspots helps, but entering the area without clearance is still risky. Wait for professionals.' },
        ],
      },
      {
        text: 'Ash and debris cover your property after the wildfire. How should you handle cleanup?',
        options: [
          { label: 'Wear N95 mask, gloves, long sleeves — wet ash before sweeping', score: 100, feedback: 'Essential! Wildfire ash contains heavy metals and carcinogens. Wetting prevents it from becoming airborne.' },
          { label: 'Use a leaf blower to clear it quickly', score: 10, feedback: 'Never dry-blow wildfire ash! It becomes airborne and is extremely toxic to inhale.' },
          { label: 'Sweep it up with a regular broom', score: 30, feedback: 'Dry sweeping kicks ash into the air. Always wet it down first, and wear proper respiratory protection.' },
        ],
      },
      {
        text: 'Your insurance company offers a quick settlement of 60% of your claim value. Should you accept?',
        options: [
          { label: 'Decline and hire a public adjuster to assess the full damage', score: 100, feedback: 'Smart! Quick settlements often undervalue losses. Public adjusters typically recover 30-50% more than initial offers.' },
          { label: 'Accept it — money now is better than waiting', score: 30, feedback: 'Quick settlements are designed to save the insurer money. Full assessments almost always yield more.' },
          { label: 'Counter-offer with double the amount', score: 50, feedback: 'Negotiating is good, but without a professional assessment, you don\'t know the true value of your claim.' },
        ],
      },
      {
        text: 'You\'re rebuilding after a wildfire. What\'s the most important fire-resistant upgrade?',
        options: [
          { label: 'Class A fire-rated roofing and enclosed eaves/vents', score: 100, feedback: 'Roofs and vents are the #1 entry point for embers. Fire-rated roofing reduces ignition risk by 80%.' },
          { label: 'Thicker exterior walls', score: 40, feedback: 'Walls matter, but embers enter through roofs and vents first. Prioritize the top of the structure.' },
          { label: 'Larger windows with better glass', score: 20, feedback: 'Multi-pane windows help, but the roof is far more vulnerable. Start from the top down.' },
        ],
      },
    ],
    financialInsight: 'Average wildfire property loss: $250,000+. Rebuilding costs have increased 35% since 2020 due to material and labor shortages.',
  },
  {
    id: 'hurricane',
    name: 'Hurricane',
    icon: 'wind',
    color: '#8b5cf6',
    bg: 'linear-gradient(135deg, #2e1065 0%, #4c1d95 50%, #1e1040 100%)',
    desc: 'A Category 3 hurricane is making landfall in 24 hours. Winds up to 130 mph expected.',
    steps: [
      {
        text: 'Hurricane is 24 hours out. You\'re in the projected path. What\'s your first action?',
        options: [
          { label: 'Board windows, secure outdoor items, fill bathtub with water', score: 100, feedback: 'Comprehensive preparation! Securing the home reduces damage by up to 40%. Stored water is critical if utilities fail.' },
          { label: 'Go buy supplies at the last minute', score: 40, feedback: 'Stores may already be sold out. Pre-season hurricane kits are recommended. Still, getting supplies is better than nothing.' },
          { label: 'Plan to ride it out without preparation', score: 10, feedback: 'Extremely dangerous. Cat 3+ hurricanes destroy unprotected structures. Preparation saves lives and money.' },
        ],
      },
      {
        text: 'The storm hits. Power is out, wind is howling. You hear a window break. What do you do?',
        options: [
          { label: 'Move to interior room, away from windows, close doors between', score: 100, feedback: 'Correct! Interior rooms on the lowest floor provide best protection. Closed doors slow wind and debris.' },
          { label: 'Try to cover the broken window', score: 20, feedback: 'Approaching a broken window during 130 mph winds is life-threatening. Flying debris is a major killer.' },
          { label: 'Go to the attic for safety', score: 15, feedback: 'The attic is the worst place — roofs are the first to fail in hurricanes. Stay low and interior.' },
        ],
      },
      {
        text: 'The eye of the hurricane passes — everything is calm. What do you do?',
        options: [
          { label: 'Stay sheltered — the other side of the storm is coming', score: 100, feedback: 'Correct! The eye is a temporary lull. The back half of the hurricane can be even more destructive.' },
          { label: 'Go outside to inspect damage and check on neighbors', score: 20, feedback: 'The calm is deceptive. The eyewall will return within minutes with full-force winds from the opposite direction.' },
          { label: 'Start driving to a shelter', score: 15, feedback: 'Roads may be blocked by debris, and the storm will resume violently. Stay where you are.' },
        ],
      },
      {
        text: 'You\'re in a mandatory evacuation zone but your neighbor refuses to leave. What do you do?',
        options: [
          { label: 'Strongly urge them to leave, share your plan, then evacuate yourself', score: 100, feedback: 'You can\'t force them, but you can inform. Your own safety comes first — don\'t delay your evacuation.' },
          { label: 'Stay with them so they\'re not alone', score: 20, feedback: 'Staying in an evacuation zone puts both of you at risk. Encourage them to leave, then go.' },
          { label: 'Report it to the police', score: 60, feedback: 'Authorities can do welfare checks, but in most states, they can\'t force evacuation. Your priority is getting out.' },
        ],
      },
      {
        text: 'Storm surge warnings say 6-9 feet of water expected. You live 8 feet above sea level. What do you do?',
        options: [
          { label: 'Evacuate inland immediately — storm surge is the deadliest hurricane threat', score: 100, feedback: 'Absolutely right! Storm surge causes 49% of hurricane deaths. Even "borderline" elevations are deadly.' },
          { label: 'Go to the second floor and wait it out', score: 40, feedback: 'Better than staying on the ground floor, but 9-foot surge at 8-foot elevation means your first floor is underwater. Evacuate if possible.' },
          { label: 'Sand-bag the doors to keep water out', score: 15, feedback: 'Sandbags can\'t hold back feet of ocean water. Storm surge has the force of the entire ocean behind it.' },
        ],
      },
      {
        text: 'You\'re evacuating and traffic is barely moving. Gas tank is at quarter full. What should you do?',
        options: [
          { label: 'Follow your planned evacuation route, conserve gas by turning off AC', score: 80, feedback: 'Good! Sticking to your plan and conserving fuel is smart. This is why keeping a full tank during hurricane season matters.' },
          { label: 'Turn off the highway and try back roads', score: 60, feedback: 'Back roads may be less congested but could also be flooded or impassable. Know your alternate routes in advance.' },
          { label: 'Return home — you won\'t make it', score: 10, feedback: 'Turning back into the storm path is extremely dangerous. Even a shelter partway is better than going back.' },
        ],
      },
      {
        text: 'After the hurricane, your roof has significant damage and it\'s about to rain again. What do you do?',
        options: [
          { label: 'Cover the roof with tarps and document damage for insurance first', score: 100, feedback: 'Correct! Tarping prevents further water damage (which insurers expect you to mitigate), and photos protect your claim.' },
          { label: 'Start full repairs right away', score: 40, feedback: 'Document first! Starting repairs before documenting can make your insurance claim harder to prove.' },
          { label: 'Wait for the insurance adjuster before doing anything', score: 30, feedback: 'Adjusters can take weeks after a major hurricane. You\'re expected to mitigate further damage — tarp that roof.' },
        ],
      },
      {
        text: 'Power has been out for 48 hours. Your freezer is full of food. Is it still safe?',
        options: [
          { label: 'If the freezer stayed closed and food still has ice crystals, it\'s safe to refreeze', score: 100, feedback: 'Correct! A full, unopened freezer keeps food safe for about 48 hours. Check temperatures — below 40°F is safe.' },
          { label: 'Throw everything away to be safe', score: 50, feedback: 'Better safe than sorry, but you may be wasting good food. Check for ice crystals and use a thermometer.' },
          { label: 'It\'s all fine — just refreeze everything', score: 20, feedback: 'Not necessarily! If food has been above 40°F for more than 2 hours, bacteria can grow. Always check temperatures.' },
        ],
      },
      {
        text: 'You\'re filing a hurricane insurance claim. Your policy has a 2% hurricane deductible on a $300,000 home. How much do you pay out of pocket?',
        options: [
          { label: '$6,000 — hurricane deductibles are percentage-based on home value', score: 100, feedback: 'Correct! 2% of $300K = $6,000. Many homeowners don\'t realize hurricane deductibles work differently than standard ones.' },
          { label: '$2,000 — same as a regular deductible', score: 20, feedback: 'Hurricane deductibles are percentage-based, not flat amounts. 2% of $300K = $6,000, not $2,000.' },
          { label: '$600 — 2% of the damage amount', score: 30, feedback: 'Hurricane deductibles are based on home value, not damage amount. It\'s 2% of the insured value of the home.' },
        ],
      },
      {
        text: 'Weeks after the hurricane, you\'re experiencing anxiety and trouble sleeping. What should you do?',
        options: [
          { label: 'Reach out to a disaster mental health hotline or counselor', score: 100, feedback: 'Important! PTSD, anxiety, and depression are common after disasters. FEMA\'s Crisis Counseling Program provides free support.' },
          { label: 'Push through it — it\'ll pass on its own', score: 30, feedback: 'Disaster-related mental health issues can worsen without support. Professional help leads to faster recovery.' },
          { label: 'Self-medicate to help sleep', score: 10, feedback: 'Self-medicating can lead to dependency and worsen mental health. Seek professional support — it\'s often free after disasters.' },
        ],
      },
    ],
    financialInsight: 'Average hurricane insurance claim: $67,000. Storm surge causes 49% of hurricane deaths and often isn\'t covered by standard policies.',
  },
  {
    id: 'tornado',
    name: 'Tornado',
    icon: 'wind',
    color: '#6366f1',
    bg: 'linear-gradient(135deg, #1e1b4b 0%, #3730a3 50%, #0f0d2e 100%)',
    desc: 'A tornado warning has been issued for your county. Rotation spotted 10 miles away and closing fast.',
    steps: [
      {
        text: 'A tornado warning is issued for your area. You\'re at home. Where do you go?',
        options: [
          { label: 'Basement or interior room on the lowest floor, away from windows', score: 100, feedback: 'Perfect! The lowest, most interior room provides the best protection from flying debris and structural collapse.' },
          { label: 'Open the windows to equalize pressure, then shelter', score: 10, feedback: 'This is a dangerous myth! Opening windows wastes precious time and does nothing to prevent damage.' },
          { label: 'Get in your car and try to outrun it', score: 20, feedback: 'Cars are extremely vulnerable to tornadoes. You\'re much safer in a solid building\'s interior.' },
        ],
      },
      {
        text: 'You\'re driving and see a tornado ahead. What should you do?',
        options: [
          { label: 'Drive at right angles to the tornado\'s path to get away', score: 100, feedback: 'Correct! Tornadoes generally move in one direction. Driving perpendicular gives you the best chance of escape.' },
          { label: 'Park under an overpass for shelter', score: 10, feedback: 'Deadly myth! Overpasses create a wind-tunnel effect with even higher winds. Never shelter under one.' },
          { label: 'Drive directly away from it as fast as possible', score: 50, feedback: 'Better than stopping, but tornadoes can change direction and move at 70+ mph. Right-angle escape is safer.' },
        ],
      },
      {
        text: 'You\'re in a mobile home when a tornado warning is issued. What do you do?',
        options: [
          { label: 'Leave immediately and go to a sturdy building or designated shelter', score: 100, feedback: 'Critical! Mobile homes offer almost no tornado protection. Even EF1 tornadoes destroy them. Get to a solid structure.' },
          { label: 'Go to the center of the mobile home and cover up', score: 30, feedback: 'Mobile homes can be destroyed by even weak tornadoes. You must evacuate to a sturdier shelter.' },
          { label: 'Lie flat in a ditch if no building is available', score: 70, feedback: 'A ditch is better than a mobile home if no building is available. Lie flat, cover your head, and stay away from trees.' },
        ],
      },
      {
        text: 'You\'re sheltering in a basement. What should you use to protect yourself?',
        options: [
          { label: 'Heavy blankets, mattress over you, or get under sturdy workbench', score: 100, feedback: 'Correct! These protect from falling debris, which causes most tornado injuries. A bike helmet adds head protection.' },
          { label: 'Crouch in a corner facing the tornado direction', score: 40, feedback: 'Crouching helps, but without overhead protection from debris, you\'re still vulnerable. Cover up!' },
          { label: 'Stand near the stairway for quick escape', score: 20, feedback: 'Priority is protection from debris, not quick escape. Get away from stairways where debris funnels down.' },
        ],
      },
      {
        text: 'The tornado passes and you emerge to find your roof gone but walls standing. What\'s the biggest immediate danger?',
        options: [
          { label: 'Downed power lines and gas leaks', score: 100, feedback: 'Correct! Downed lines can be energized and invisible in debris. Gas leaks cause post-tornado explosions. Stay alert.' },
          { label: 'Another tornado hitting the same spot', score: 30, feedback: 'While tornado clusters happen, the immediate dangers are utilities. Check for gas smells and avoid any downed wires.' },
          { label: 'Looters coming to the neighborhood', score: 15, feedback: 'Looting is rare and not an immediate life-safety threat. Downed power lines and gas leaks are the real danger.' },
        ],
      },
      {
        text: 'You hear a loud roar like a freight train at night. Your power just went out. What do you do?',
        options: [
          { label: 'Immediately go to your safe room — the roar means a tornado is very close', score: 100, feedback: 'The freight-train sound is a classic tornado indicator. You may have only seconds. Move NOW to interior shelter.' },
          { label: 'Go outside to look at the sky', score: 10, feedback: 'At night you can\'t see a tornado. Going outside puts you in the path of debris. Take shelter immediately.' },
          { label: 'Check the weather app on your phone', score: 30, feedback: 'The freight-train sound means the tornado may already be on top of you. Shelter first, check later.' },
        ],
      },
      {
        text: 'Your safe room has no phone signal after the tornado. How do you call for help?',
        options: [
          { label: 'Try texting — texts often get through when calls can\'t', score: 100, feedback: 'Correct! Texts require less bandwidth and can queue up. Emergency services also monitor text-to-911 in many areas.' },
          { label: 'Go outside to get a signal', score: 40, feedback: 'Be extremely careful — downed power lines and unstable structures make post-tornado outdoors dangerous. Text from safety first.' },
          { label: 'Use social media to post your location', score: 50, feedback: 'Social media can help, but texting 911 (where available) or family directly is more reliable for rescue.' },
        ],
      },
      {
        text: 'Your home is destroyed but your neighbor\'s is untouched. They say you must have "done something wrong." What happened?',
        options: [
          { label: 'Tornadoes have extremely narrow, unpredictable paths — it\'s not about what you did', score: 100, feedback: 'Correct! Tornadoes can destroy one house and skip the next. Their paths are often only a few hundred yards wide.' },
          { label: 'Your house was probably built cheaper', score: 20, feedback: 'Construction quality matters, but tornadoes routinely destroy well-built homes while skipping nearby structures.' },
          { label: 'Your house must have been in a low spot', score: 20, feedback: 'Topography has minimal effect on tornadoes. They can climb hills and cross valleys. The path is just random.' },
        ],
      },
      {
        text: 'FEMA offers disaster assistance after the tornado. What does FEMA typically cover that insurance doesn\'t?',
        options: [
          { label: 'Temporary housing, home repairs for uninsured damage, and personal property', score: 100, feedback: 'Correct! FEMA fills gaps insurance doesn\'t cover. Apply within 60 days at DisasterAssistance.gov or call 1-800-621-3362.' },
          { label: 'FEMA replaces everything insurance won\'t pay for', score: 20, feedback: 'FEMA assistance is limited and meant to make housing safe, not restore everything. Average FEMA grant is ~$5,000.' },
          { label: 'FEMA only provides loans, not grants', score: 30, feedback: 'FEMA provides both grants and low-interest SBA loans. Grants don\'t need to be repaid.' },
        ],
      },
      {
        text: 'You want to build a tornado safe room in your home. Where is the best location?',
        options: [
          { label: 'Interior ground floor or basement, anchored to the foundation', score: 100, feedback: 'Correct! FEMA-rated safe rooms must be anchored to the slab. They can withstand EF5 winds (250+ mph). FEMA may reimburse up to 75% of cost.' },
          { label: 'The garage — it has the most space', score: 20, feedback: 'Garages have large doors that fail easily in tornados. Interior rooms without exterior walls are much safer.' },
          { label: 'A second-floor closet — tornadoes lift things up', score: 15, feedback: 'Upper floors are more exposed to wind. The lowest floor, most interior location is always safest.' },
        ],
      },
    ],
    financialInsight: 'Average tornado damage claim: $75,000–$500,000+. Tornadoes cause $1.1 billion in damage annually in the US. Safe rooms cost $3,000–$8,500.',
  },
  {
    id: 'winter-storm',
    name: 'Winter Storm',
    icon: 'snowflake',
    color: '#06b6d4',
    bg: 'linear-gradient(135deg, #0c3547 0%, #155e75 50%, #042f3e 100%)',
    desc: 'A severe blizzard warning: 18+ inches of snow, sub-zero wind chills, and whiteout conditions expected.',
    steps: [
      {
        text: 'A blizzard warning is issued for tomorrow. You have 12 hours to prepare. What\'s your top priority?',
        options: [
          { label: 'Stock food, water, medications, and ensure heating fuel/backup heat source', score: 100, feedback: 'Excellent! Power outages during blizzards can last days. Water pipes may freeze. Having 3 days of supplies is essential.' },
          { label: 'Go buy a snow blower', score: 30, feedback: 'Snow removal is important but secondary. Survival supplies (heat, water, food) come first.' },
          { label: 'Fill up the car with gas', score: 60, feedback: 'Full gas tank is smart (prevents fuel line freeze), but ensuring heat and water takes priority.' },
        ],
      },
      {
        text: 'Power goes out during the blizzard. Inside temperature is dropping. How do you heat safely?',
        options: [
          { label: 'Use a fireplace or wood stove with proper ventilation, seal off one room', score: 100, feedback: 'Correct! Heating one room conserves warmth. Proper ventilation prevents carbon monoxide poisoning.' },
          { label: 'Run the gas oven with the door open', score: 10, feedback: 'Extremely dangerous! Gas ovens produce carbon monoxide. This kills dozens of people every winter.' },
          { label: 'Start the car in the garage and run the heater', score: 10, feedback: 'Never run a car in an enclosed garage! Carbon monoxide builds up rapidly and is lethal.' },
        ],
      },
      {
        text: 'Your pipes have frozen. What\'s the best way to thaw them?',
        options: [
          { label: 'Apply gentle heat with a hair dryer or warm towels, starting from the faucet end', score: 100, feedback: 'Correct! Slow, gentle heating prevents pipe bursts. Work from the open faucet toward the frozen section.' },
          { label: 'Use a blowtorch to heat the pipes quickly', score: 10, feedback: 'Blowtorches can ignite walls and cause pipes to burst from rapid thermal expansion. Never use open flame.' },
          { label: 'Wait for them to thaw on their own', score: 30, feedback: 'Frozen pipes can burst, causing $5,000-$70,000 in water damage. Active thawing prevents this.' },
        ],
      },
      {
        text: 'You must drive during the storm for a medical emergency. How do you prepare?',
        options: [
          { label: 'Tell someone your route, bring blankets/snacks/phone charger, drive slowly', score: 100, feedback: 'Good preparation! If stranded, staying in the car with the engine periodically running (exhaust clear) keeps you safest.' },
          { label: 'Drive fast to get there before conditions worsen', score: 10, feedback: 'Speeding on icy roads is the #1 cause of winter storm deaths. Slow down and plan for the worst.' },
          { label: 'Just go — it\'s an emergency, no time to prepare', score: 30, feedback: 'A 2-minute preparation could save your life if you get stranded. Always tell someone your route.' },
        ],
      },
      {
        text: 'Your car gets stuck in a snowdrift on a rural road. Visibility is zero. What do you do?',
        options: [
          { label: 'Stay in the car, run engine 10 min/hour, keep exhaust pipe clear of snow', score: 100, feedback: 'Correct! Your car is your best shelter. Running the engine periodically provides heat. Blocked exhaust = CO death.' },
          { label: 'Leave the car and walk to find help', score: 10, feedback: 'Whiteout conditions make it impossible to navigate. People have died just yards from safety. Stay in the car.' },
          { label: 'Run the engine continuously with windows sealed', score: 20, feedback: 'Continuous running wastes fuel and risks CO buildup. Run 10 minutes per hour and crack a window slightly.' },
        ],
      },
      {
        text: 'Elderly neighbors haven\'t been seen in 24 hours during the blizzard. What do you do?',
        options: [
          { label: 'Call for a welfare check, then safely check on them if you can', score: 100, feedback: 'Correct! Elderly are the most vulnerable to cold. Hypothermia can set in even indoors if heat fails.' },
          { label: 'They\'re probably fine — adults can take care of themselves', score: 10, feedback: 'Hypothermia deaths in the elderly happen indoors every winter. A quick check can save a life.' },
          { label: 'Wait until the storm passes to check', score: 30, feedback: 'Hypothermia can be fatal within hours. Don\'t wait if you can safely reach them or call for help.' },
        ],
      },
      {
        text: 'The blizzard has passed. You need to shovel your driveway. What\'s the safest approach?',
        options: [
          { label: 'Take frequent breaks, push snow instead of lifting, stay hydrated', score: 100, feedback: 'Correct! Snow shoveling causes ~100 fatal heart attacks per year in the US. It\'s as strenuous as heavy weightlifting.' },
          { label: 'Power through it quickly to get it done', score: 20, feedback: 'Strenuous shoveling without breaks is the leading cause of winter heart attacks, especially for ages 45+.' },
          { label: 'Throw hot water on the snow to melt it', score: 10, feedback: 'Hot water refreezes into a sheet of ice, making your driveway more dangerous than the snow.' },
        ],
      },
      {
        text: 'Your roof is creaking under heavy snow load. What should you do?',
        options: [
          { label: 'Use a roof rake from the ground to remove snow from edges, monitor for sagging', score: 100, feedback: 'Correct! Removing snow from eaves reduces weight. Most roofs handle 20 lbs/sq ft — wet snow can exceed this quickly.' },
          { label: 'Climb on the roof to shovel snow off', score: 10, feedback: 'Icy, snow-covered roofs are extremely slippery. Falling off a roof kills or injures thousands each winter.' },
          { label: 'It\'ll be fine — roofs are built to handle snow', score: 30, feedback: 'Flat or older roofs can collapse under heavy wet snow. The creaking is a warning sign — take action.' },
        ],
      },
      {
        text: 'A winter storm burst a pipe and flooded your living room. What\'s your first step?',
        options: [
          { label: 'Shut off the main water valve, then document damage and call your insurer', score: 100, feedback: 'Correct! Stopping water flow limits damage. Burst pipe claims average $10,000+. Document before cleaning up.' },
          { label: 'Start mopping up the water immediately', score: 40, feedback: 'Stop the water source first! Mopping while the pipe is still flowing is pointless.' },
          { label: 'Call a plumber and wait', score: 50, feedback: 'Good idea to call a plumber, but shut off the water valve yourself first to stop ongoing damage.' },
        ],
      },
      {
        text: 'You lose power for 3 days in sub-zero temps. Your home drops to 35°F inside. What\'s the risk to the house itself?',
        options: [
          { label: 'Pipes can freeze and burst — open faucets to a drip and drain the system if possible', score: 100, feedback: 'Correct! Pipes freeze around 20°F but can freeze in poorly insulated walls at 32°F. Dripping faucets reduce pressure buildup.' },
          { label: 'No risk — houses are built for cold weather', score: 10, feedback: 'Cold homes suffer frozen pipes, which burst and cause average damage of $10,000-$70,000. Protect your plumbing.' },
          { label: 'Just keep all doors and cabinets closed to trap heat', score: 40, feedback: 'Actually, opening cabinet doors under sinks lets warm air reach pipes. Closing them traps cold air around plumbing.' },
        ],
      },
    ],
    financialInsight: 'Average burst pipe claim: $10,000–$70,000. Winter storms cause $2.1 billion in annual US property damage. Space heaters cause 1,700 fires/year.',
  },
  {
    id: 'tsunami',
    name: 'Tsunami',
    icon: 'waves',
    color: '#0ea5e9',
    bg: 'linear-gradient(135deg, #0c4a6e 0%, #0369a1 50%, #082f49 100%)',
    desc: 'A massive earthquake offshore has triggered a tsunami warning. Waves could arrive within minutes.',
    steps: [
      {
        text: 'You\'re at the beach and feel a strong earthquake lasting over 20 seconds. What do you do?',
        options: [
          { label: 'Immediately move inland or to high ground — the earthquake IS the warning', score: 100, feedback: 'Correct! A long, strong earthquake near the coast is nature\'s tsunami alarm. Don\'t wait for an official warning.' },
          { label: 'Wait for an official tsunami warning on your phone', score: 20, feedback: 'For nearby earthquakes, a tsunami can arrive in minutes — before any official warning. Move immediately.' },
          { label: 'Look at the ocean to see if a wave is coming', score: 10, feedback: 'By the time you see the wave, it\'s too late. Tsunamis travel at 500+ mph in deep water. Run to high ground now.' },
        ],
      },
      {
        text: 'The ocean suddenly recedes, exposing the sea floor far beyond normal low tide. What does this mean?',
        options: [
          { label: 'A tsunami wave is likely minutes away — run to high ground immediately', score: 100, feedback: 'Correct! Ocean recession (drawback) is a classic tsunami warning sign. The water will return as a massive surge.' },
          { label: 'It\'s just an unusual low tide — interesting to explore', score: 10, feedback: 'This is one of the deadliest misconceptions. People who walk onto the exposed sea floor often don\'t survive.' },
          { label: 'Take photos — this is a once-in-a-lifetime event', score: 10, feedback: 'There\'s no time for photos. Drawback means a wave is imminent. Every second of delay reduces your survival chance.' },
        ],
      },
      {
        text: 'You need to evacuate but can\'t reach high ground. What\'s your best alternative?',
        options: [
          { label: 'Go to the upper floors (3rd+) of a reinforced concrete building', score: 100, feedback: 'Correct! Vertical evacuation to reinforced concrete buildings is recommended when high ground is unreachable.' },
          { label: 'Drive inland as fast as possible', score: 40, feedback: 'Roads may be gridlocked. If you can drive and the route is clear, go. But a tall concrete building nearby is more reliable.' },
          { label: 'Hold onto a tree or pole', score: 10, feedback: 'Tsunami forces can be 1,000+ lbs per square foot. No one can hold on. Get to height, not attachment points.' },
        ],
      },
      {
        text: 'You\'re on the 4th floor of a hotel when the tsunami hits. The first wave has passed. What do you do?',
        options: [
          { label: 'Stay put — tsunamis come in multiple waves, and later ones can be bigger', score: 100, feedback: 'Correct! Tsunamis are a series of waves over hours. The first wave is often NOT the largest.' },
          { label: 'Go down to check on your car and belongings', score: 10, feedback: 'Extremely dangerous! Subsequent waves arrive 10-60 minutes apart and can be larger than the first.' },
          { label: 'Move to a lower floor to be closer to an exit', score: 20, feedback: 'Stay high! Later waves could be even bigger. Don\'t descend until officials give the all-clear.' },
        ],
      },
      {
        text: 'How far inland should you evacuate if you can\'t reach high ground?',
        options: [
          { label: 'At least 2 miles inland and 100 feet above sea level if possible', score: 100, feedback: 'Correct! Major tsunamis can travel miles inland. The 2011 Japan tsunami went 6 miles inland in flat areas.' },
          { label: 'Just past the beach — a few hundred yards', score: 10, feedback: 'Tsunamis easily travel miles inland. A few hundred yards provides almost no protection.' },
          { label: 'Half a mile should be plenty', score: 30, feedback: 'Depending on terrain, half a mile may not be enough. Aim for 2+ miles or significant elevation.' },
        ],
      },
      {
        text: 'A tsunami warning is issued but the estimated arrival is 4 hours away. What do you do?',
        options: [
          { label: 'Evacuate now while roads are clear — don\'t wait until the last minute', score: 100, feedback: 'Correct! Early evacuation avoids traffic jams. The 4-hour window is a gift — use it wisely.' },
          { label: 'Wait 3 hours then leave — plenty of time', score: 20, feedback: 'Everyone else will have the same idea. Roads will be gridlocked. Leave immediately.' },
          { label: 'Stay and watch the ocean — you\'ll see it coming', score: 10, feedback: 'Tsunamis travel at jet speed. By the time it\'s visible, you have seconds. Evacuate now.' },
        ],
      },
      {
        text: 'After the tsunami, floodwater has receded from your street. Is it safe to return home?',
        options: [
          { label: 'Wait for official all-clear — more waves may come for 12+ hours', score: 100, feedback: 'Correct! Tsunami wave trains can continue for 12-24 hours. The all-clear is based on tide gauge monitoring.' },
          { label: 'The water\'s gone, so it must be safe now', score: 10, feedback: 'Water receding between waves is exactly what happens during a tsunami. More waves are likely coming.' },
          { label: 'Go back if no waves hit in the last hour', score: 30, feedback: 'Wave intervals can be over an hour apart. Only return after the official tsunami all-clear is issued.' },
        ],
      },
      {
        text: 'You\'re visiting a coastal town and notice tsunami evacuation route signs. What should you do with this information?',
        options: [
          { label: 'Mentally note the evacuation routes and identify high ground near your location', score: 100, feedback: 'Smart! Knowing evacuation routes before a disaster strikes is one of the most important preparation steps.' },
          { label: 'Ignore them — tsunamis are extremely rare', score: 10, feedback: 'Tsunamis may be rare, but they\'re catastrophic when they occur. Knowing the route takes 30 seconds and could save your life.' },
          { label: 'Take a photo to look at later', score: 40, feedback: 'A photo helps, but memorizing the route is better. In a real event, you may not have time to check your phone.' },
        ],
      },
      {
        text: 'Tsunami debris and standing water surround your home. What health hazard should you be most concerned about?',
        options: [
          { label: 'Contaminated water — sewage, chemicals, and sharp debris make it extremely toxic', score: 100, feedback: 'Correct! Tsunami floodwater is a toxic soup of sewage, fuel, chemicals, and sharp debris. Avoid contact and wear PPE for cleanup.' },
          { label: 'Sharks brought inland by the wave', score: 10, feedback: 'While marine life can be carried inland, the real dangers are contamination, structural instability, and disease.' },
          { label: 'Sunburn from being outside during cleanup', score: 15, feedback: 'Sun protection matters, but contaminated water and structural hazards are far more dangerous and immediate.' },
        ],
      },
      {
        text: 'You live in a tsunami-prone coastal area. What\'s the best long-term preparedness investment?',
        options: [
          { label: 'Create a family evacuation plan with meeting points and practice it yearly', score: 100, feedback: 'Best investment! Japan\'s "tendenko" tradition (each person runs to safety immediately) saved thousands in 2011.' },
          { label: 'Build a sea wall around your property', score: 20, feedback: 'Personal sea walls can\'t withstand major tsunamis. The 2011 Japan tsunami overtopped 30-foot government sea walls.' },
          { label: 'Buy a boat to ride out the wave', score: 10, feedback: 'Small boats are destroyed by tsunamis near shore. Large ships survive only in deep water (500+ feet).' },
        ],
      },
    ],
    financialInsight: 'The 2011 Japan tsunami caused $235 billion in damage. Most US homeowner policies exclude tsunami damage. Flood insurance (NFIP) covers tsunami damage up to $250,000.',
  },
  {
    id: 'heat-wave',
    name: 'Extreme Heat',
    icon: 'sun',
    color: '#f97316',
    bg: 'linear-gradient(135deg, #7c2d12 0%, #c2410c 50%, #431407 100%)',
    desc: 'An extreme heat wave: temperatures exceeding 110°F for 5+ consecutive days. Heat is the #1 weather killer.',
    steps: [
      {
        text: 'Temperatures hit 110°F. Your AC unit just broke. What\'s your most important action?',
        options: [
          { label: 'Go to a public cooling center (library, mall, community center)', score: 100, feedback: 'Correct! When AC fails in extreme heat, get to a cooled space. Heat stroke can be fatal within hours at 110°F+.' },
          { label: 'Open all windows and use fans', score: 30, feedback: 'When it\'s hotter outside than inside, opening windows makes it worse. Fans don\'t cool air — they just move hot air.' },
          { label: 'Take a cold shower and tough it out', score: 40, feedback: 'Cold showers provide temporary relief, but without AC in 110°F heat, your core temperature will keep rising. Seek a cooled space.' },
        ],
      },
      {
        text: 'You find an elderly neighbor confused and with hot, dry skin during the heat wave. What do you do?',
        options: [
          { label: 'Call 911 immediately — this is heat stroke, a medical emergency', score: 100, feedback: 'Correct! Hot, dry skin + confusion = heat stroke. This is life-threatening. Cool them with wet cloths while waiting for EMS.' },
          { label: 'Give them lots of cold water to drink', score: 40, feedback: 'Hydration helps heat exhaustion, but confusion + dry skin = heat stroke. They need 911 NOW. They may not be able to swallow safely.' },
          { label: 'Tell them to rest in the shade — they\'ll be fine', score: 10, feedback: 'Heat stroke is a medical emergency with a 10-50% fatality rate. Shade alone won\'t reverse it. Call 911.' },
        ],
      },
      {
        text: 'What\'s the difference between heat exhaustion and heat stroke?',
        options: [
          { label: 'Heat exhaustion: heavy sweating, weakness. Heat stroke: NO sweating, confusion, hot skin', score: 100, feedback: 'Correct! The key difference is that heat stroke victims stop sweating. Heat stroke is life-threatening; heat exhaustion can lead to it.' },
          { label: 'They\'re the same thing, just different names', score: 10, feedback: 'They\'re very different! Heat exhaustion is serious but treatable. Heat stroke can be fatal without emergency care.' },
          { label: 'Heat stroke is just a more severe headache from the sun', score: 15, feedback: 'Heat stroke is organ failure from overheating. Core temperature exceeds 104°F and the body\'s cooling system shuts down.' },
        ],
      },
      {
        text: 'Your electricity bill will be enormous from running AC 24/7. How do you reduce costs while staying safe?',
        options: [
          { label: 'Set AC to 78°F, close blinds, use fans to circulate cooled air', score: 100, feedback: 'Smart balance! 78°F with fans feels like 72°F. Closed blinds reduce heat gain by 45%. This can cut costs 10-25%.' },
          { label: 'Turn AC off during the day and only run it at night', score: 20, feedback: 'Dangerous! Peak heat during the day is when heat illness occurs. AC off at 110°F can be life-threatening.' },
          { label: 'Set AC to 68°F — comfort is worth the cost', score: 50, feedback: 'You\'ll stay cool, but each degree below 78°F adds 3-5% to your energy bill. Smart settings save money safely.' },
        ],
      },
      {
        text: 'You need to work outdoors during the heat wave. How do you stay safe?',
        options: [
          { label: 'Work during coolest hours, take 15-min breaks every hour, drink water before feeling thirsty', score: 100, feedback: 'Correct! OSHA recommends water, rest, shade. Drink water every 15-20 minutes. By the time you\'re thirsty, you\'re already dehydrating.' },
          { label: 'Drink lots of energy drinks to stay hydrated', score: 20, feedback: 'Caffeine and sugar in energy drinks can worsen dehydration. Plain water or electrolyte drinks are best.' },
          { label: 'Push through it — your body will adapt', score: 10, feedback: 'Heat acclimatization takes 1-2 weeks of gradual exposure. Working full intensity in extreme heat causes heat stroke.' },
        ],
      },
      {
        text: 'You left your dog in the car "for just 5 minutes" on a 95°F day. What\'s the car\'s interior temperature?',
        options: [
          { label: 'It can reach 120°F+ in 5 minutes — never leave pets or children in cars', score: 100, feedback: 'Correct! Cars heat 20-30°F above outside temp within minutes. Even cracked windows don\'t help. This kills 38 children/year in the US.' },
          { label: 'About 95°F — same as outside with windows cracked', score: 10, feedback: 'Cars act as greenhouses. At 95°F outside, the interior reaches 120°F+ in under 10 minutes, even with cracked windows.' },
          { label: 'Around 105°F — warm but not dangerous for a few minutes', score: 20, feedback: 'It reaches 120°F+ far faster than most people think. Five minutes can be fatal for children and pets.' },
        ],
      },
      {
        text: 'During a heat wave, when is the most dangerous time of day?',
        options: [
          { label: 'Late afternoon (3-5 PM) — heat accumulates all day and peaks then', score: 100, feedback: 'Correct! While solar radiation peaks at noon, ground and air temperature peaks at 3-5 PM as heat accumulates.' },
          { label: 'High noon when the sun is directly overhead', score: 50, feedback: 'Solar radiation peaks at noon, but air temperature continues rising for hours after. Late afternoon is actually hottest.' },
          { label: 'Morning — your body hasn\'t adjusted yet', score: 15, feedback: 'Mornings are typically the coolest part of the day. Peak danger is late afternoon.' },
        ],
      },
      {
        text: 'Your power goes out during the heat wave. What\'s the biggest risk to check first?',
        options: [
          { label: 'Check on vulnerable family members — elderly, children, and those on medication', score: 100, feedback: 'Correct! Vulnerable populations can develop heat stroke within hours without cooling. They\'re the top priority.' },
          { label: 'Check if the food in the fridge is still cold', score: 30, feedback: 'Food safety matters (fridge stays cold ~4 hours if unopened), but human safety comes first in extreme heat.' },
          { label: 'Call the power company to report the outage', score: 50, feedback: 'Reporting is important, but checking on vulnerable people is the immediate life-safety priority.' },
        ],
      },
      {
        text: 'A prolonged heat wave is driving up demand for water. How should you prepare?',
        options: [
          { label: 'Store 1 gallon per person per day, minimize outdoor water use, fix leaks', score: 100, feedback: 'Correct! Heat waves strain water systems. Having stored water protects you if pressure drops or boil advisories are issued.' },
          { label: 'Fill the pool — you\'ll need it for cooling', score: 20, feedback: 'Pools use thousands of gallons. During water stress, this is wasteful. Store drinking water instead.' },
          { label: 'Water will always be available from the tap', score: 10, feedback: 'Heat waves have caused water system failures in multiple US cities. Don\'t assume supply is guaranteed.' },
        ],
      },
      {
        text: 'After a week-long heat wave, your water bill and electricity bill are both double normal. What financial step should you take?',
        options: [
          { label: 'Check for utility assistance programs and LIHEAP (Low Income Home Energy Assistance)', score: 100, feedback: 'Correct! LIHEAP helps with cooling costs. Many utilities offer payment plans or forgiveness during declared heat emergencies.' },
          { label: 'Just pay it — extreme bills happen sometimes', score: 40, feedback: 'You can pay it, but assistance programs exist specifically for disaster-related utility spikes. No reason not to check.' },
          { label: 'Dispute the bill with the utility company', score: 30, feedback: 'The usage was real, so disputes rarely work. Assistance programs are a better approach for genuine financial strain.' },
        ],
      },
    ],
    financialInsight: 'Heat waves cost the US $100+ billion annually in health costs and lost productivity. Heat-related ER visits cost $1,000-$30,000 per incident.',
  },
  {
    id: 'drought',
    name: 'Drought',
    icon: 'sun',
    color: '#a16207',
    bg: 'linear-gradient(135deg, #451a03 0%, #78350f 50%, #292524 100%)',
    desc: 'A severe multi-year drought has depleted reservoirs. Water rationing is in effect and wildfire risk is extreme.',
    steps: [
      {
        text: 'Mandatory water rationing is announced: 50 gallons per person per day. The average American uses 80-100. Where do you cut first?',
        options: [
          { label: 'Shorten showers, stop watering the lawn, fix any leaks', score: 100, feedback: 'Correct! Lawn watering uses 30-60% of household water. A leaky faucet wastes 3,000+ gallons per year.' },
          { label: 'Stop doing laundry as often', score: 50, feedback: 'Reducing laundry helps (~15 gal/load), but lawn watering is by far the biggest opportunity (up to 60% of usage).' },
          { label: 'Stop drinking as much water to conserve', score: 10, feedback: 'Never reduce drinking water! During drought, cut outdoor use first. Personal hydration is non-negotiable.' },
        ],
      },
      {
        text: 'Your well is producing less water as groundwater drops. What should you do?',
        options: [
          { label: 'Consult a hydrologist about well depth, store water, and reduce usage drastically', score: 100, feedback: 'Correct! Wells can go dry during drought. A hydrologist can advise on deepening. Always have backup water storage.' },
          { label: 'Drill deeper immediately', score: 50, feedback: 'Deeper wells help but cost $5,000-$15,000+ and may not find water. Get professional assessment first.' },
          { label: 'It\'ll come back when it rains', score: 10, feedback: 'Groundwater can take years to recharge even after rain. Acting now prevents being without water entirely.' },
        ],
      },
      {
        text: 'Drought has increased wildfire risk to extreme levels. What should you do with your property?',
        options: [
          { label: 'Create defensible space: clear dead vegetation 30+ feet from structures', score: 100, feedback: 'Correct! Drought-stressed vegetation is highly flammable. Defensible space is your best protection from drought-driven wildfires.' },
          { label: 'Keep watering your garden to keep plants green and fire-resistant', score: 20, feedback: 'During water rationing, lawn irrigation is usually prohibited. Dead vegetation clearance is more effective anyway.' },
          { label: 'Stock up on fire extinguishers', score: 40, feedback: 'Extinguishers help for small fires, but they can\'t stop a wildfire. Defensible space is the proven strategy.' },
        ],
      },
      {
        text: 'Your area\'s reservoir is at 15% capacity. What long-term water solutions should you consider?',
        options: [
          { label: 'Install rain collection, greywater recycling, and drought-resistant landscaping', score: 100, feedback: 'Excellent! These reduce dependence on municipal water by 40-60%. Rain barrels and greywater systems are increasingly legal.' },
          { label: 'Buy bottled water in bulk', score: 40, feedback: 'Works short-term but is expensive ($1,000+/year for a family) and unsustainable. Invest in permanent solutions.' },
          { label: 'Move to an area with more water', score: 30, feedback: 'Relocation is extreme. Most droughts are manageable with conservation and efficiency improvements.' },
        ],
      },
      {
        text: 'Drought is causing food prices to spike. Milk is up 30%, meat is up 25%. How do you manage?',
        options: [
          { label: 'Shift to more affordable proteins (beans, eggs), buy seasonal produce, reduce waste', score: 100, feedback: 'Smart! Drought drives up animal products most (livestock need water and feed). Plant-based proteins are more water-efficient.' },
          { label: 'Buy in bulk and freeze everything before prices go higher', score: 60, feedback: 'Stocking up can be smart, but hoarding drives prices higher for everyone. Balance personal prep with community impact.' },
          { label: 'Nothing I can do — prices are what they are', score: 20, feedback: 'Diet adjustments, food banks, and SNAP benefits can all help. There are always options to manage food costs.' },
        ],
      },
      {
        text: 'Your foundation is cracking because drought has caused the soil to shrink. What should you do?',
        options: [
          { label: 'Water the foundation perimeter with a soaker hose to keep soil moisture stable', score: 100, feedback: 'Correct! Foundation watering during drought prevents $5,000-$30,000+ in structural repairs. Keep soil moisture consistent.' },
          { label: 'Foundation repair is needed — call a contractor immediately', score: 50, feedback: 'Repair may eventually be needed, but maintaining soil moisture first can stop cracking from worsening.' },
          { label: 'Ignore it — cracks in foundations are normal', score: 10, feedback: 'Drought-related foundation damage worsens over time. Early intervention saves thousands in repair costs.' },
        ],
      },
      {
        text: 'Your community\'s water source is contaminated with higher levels of minerals due to drought concentration. What\'s the health concern?',
        options: [
          { label: 'Concentrated minerals and algal blooms can cause GI illness — use a certified filter', score: 100, feedback: 'Correct! Drought concentrates contaminants. Algal blooms produce toxins that standard treatment may not fully remove.' },
          { label: 'Minerals are healthy — drought water is actually more nutritious', score: 10, feedback: 'Concentrated arsenic, nitrates, and algal toxins are harmful. Higher mineral content from drought is dangerous, not beneficial.' },
          { label: 'Boil the water before drinking to be safe', score: 40, feedback: 'Boiling kills bacteria but doesn\'t remove chemical contaminants or algal toxins. Filtration is needed.' },
        ],
      },
      {
        text: 'Drought is entering its 3rd year. Your homeowner insurance company drops your coverage due to wildfire risk. What do you do?',
        options: [
          { label: 'Apply for your state\'s FAIR Plan (insurer of last resort), improve defensible space', score: 100, feedback: 'Correct! FAIR Plans provide basic coverage when private insurers withdraw. Improving your property can eventually get you back to standard coverage.' },
          { label: 'Go without insurance — nothing will happen', score: 10, feedback: 'Going uninsured during extreme wildfire risk is financially catastrophic. A single fire could destroy everything.' },
          { label: 'Sue the insurance company', score: 20, feedback: 'Insurers generally have the right to non-renew policies. FAIR Plans are the practical solution.' },
        ],
      },
      {
        text: 'Agricultural drought has caused local farmers to go bankrupt. How does this affect you directly?',
        options: [
          { label: 'Local food prices rise, property values may fall, and community tax base shrinks', score: 100, feedback: 'Correct! Drought creates cascading economic effects: food costs, property values, tax revenue, and local business closures.' },
          { label: 'It doesn\'t — I don\'t farm', score: 10, feedback: 'Agricultural collapse affects everyone through food prices, local economy, and community services funded by tax revenue.' },
          { label: 'I might benefit — land will be cheap to buy', score: 30, feedback: 'Cheap drought-affected land may seem like a deal, but without water it has limited value and high risk.' },
        ],
      },
      {
        text: 'What government assistance is available during a federally declared drought disaster?',
        options: [
          { label: 'USDA Emergency Loans, FEMA assistance, SBA disaster loans, and water hauling programs', score: 100, feedback: 'Correct! Multiple federal programs activate during drought declarations. Apply early — funds are limited.' },
          { label: 'Only farmers get drought assistance', score: 20, feedback: 'While USDA programs target agriculture, FEMA and SBA assist all affected residents and businesses.' },
          { label: 'The government doesn\'t help with drought — it\'s not a "real" disaster', score: 10, feedback: 'Drought is the costliest natural disaster type globally. Federal disaster declarations unlock billions in aid.' },
        ],
      },
    ],
    financialInsight: 'The 2012 US drought caused $30 billion in agricultural losses alone. Drought-related foundation repairs cost homeowners $5,000-$30,000+.',
  },
]

// ─── Component ──────────────────────────────────────────────────────────────

export default function VRSimulatorPage() {
  const [selected, setSelected] = useState(null)
  const [stepIndex, setStepIndex] = useState(0)
  const [scores, setScores] = useState([])
  const [answered, setAnswered] = useState(null) // { index, score, feedback }
  const [phase, setPhase] = useState('select') // select | intro | sim | result
  const [introCountdown, setIntroCountdown] = useState(3)
  const [shakeIntensity, setShakeIntensity] = useState(0)
  const containerRef = useRef(null)

  // Intro countdown
  useEffect(() => {
    if (phase !== 'intro') return
    if (introCountdown <= 0) {
      setPhase('sim')
      return
    }
    const t = setTimeout(() => setIntroCountdown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [phase, introCountdown])

  // Screen shake effect for earthquake
  useEffect(() => {
    if (phase !== 'sim' || !selected) return
    if (selected.id === 'earthquake' && stepIndex === 0 && !answered) {
      const interval = setInterval(() => {
        setShakeIntensity(Math.random() * 6 - 3)
      }, 50)
      return () => { clearInterval(interval); setShakeIntensity(0) }
    }
    setShakeIntensity(0)
  }, [phase, selected, stepIndex, answered])

  const startScenario = useCallback((scenario) => {
    setSelected(scenario)
    setStepIndex(0)
    setScores([])
    setAnswered(null)
    setIntroCountdown(3)
    setPhase('intro')
  }, [])

  const handleAnswer = useCallback((option, index) => {
    setAnswered({ index, score: option.score, feedback: option.feedback })
    setScores(prev => [...prev, option.score])
  }, [])

  const nextStep = useCallback(() => {
    if (stepIndex + 1 >= selected.steps.length) {
      setPhase('result')
    } else {
      setStepIndex(i => i + 1)
      setAnswered(null)
    }
  }, [stepIndex, selected])

  const reset = useCallback(() => {
    setSelected(null)
    setStepIndex(0)
    setScores([])
    setAnswered(null)
    setPhase('select')
  }, [])

  const totalScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0
  const grade = totalScore >= 90 ? 'A' : totalScore >= 75 ? 'B' : totalScore >= 55 ? 'C' : totalScore >= 35 ? 'D' : 'F'
  const gradeColor = totalScore >= 90 ? '#10b981' : totalScore >= 75 ? '#3b82f6' : totalScore >= 55 ? '#f59e0b' : '#ef4444'

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--ds-bg)' }}>
      <Navbar />

      {/* ── Scenario Select ── */}
      {phase === 'select' && (
        <>
          <section style={{ background: 'linear-gradient(180deg, #4E96D1 0%, #6CB8EA 38%, #A8D9F5 72%, #D0ECFA 100%)', marginTop: '-5rem', padding: '9rem 1.5rem 4rem', textAlign: 'center' }}>
            <div style={{ maxWidth: '44rem', margin: '0 auto' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(78,150,209,0.18)', border: '1px solid rgba(78,150,209,0.35)', borderRadius: '2rem', padding: '0.35rem 1rem', marginBottom: '1.25rem', fontSize: '0.75rem', fontWeight: 700, color: 'rgba(255,255,255,0.95)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                <Icon name="sparkles" size={14} /> AWARENESS QUIZ
              </div>
              <h1 style={{ fontSize: '2.8rem', fontWeight: 900, color: '#fff', margin: '0 0 0.75rem', letterSpacing: '-0.02em', fontFamily: "'Fraunces', Georgia, serif" }}>
                Disaster Awareness Quiz
              </h1>
              <p style={{ fontSize: '1.1rem', fontWeight: 600, color: 'rgba(255,255,255,0.92)', margin: '0 0 1.25rem' }}>
                Test Your Knowledge of Life-Saving Decisions
              </p>
              <p style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.78)', lineHeight: 1.7, maxWidth: '36rem', margin: '0 auto' }}>
                Choose a disaster scenario below to test your emergency preparedness knowledge. Answer 10 questions per scenario, learn the reasoning behind each choice, and discover how your decisions affect safety and financial outcomes.
              </p>
            </div>
          </section>

          <section style={{ padding: '3rem 1.5rem', maxWidth: '72rem', margin: '0 auto', width: '100%' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
              {SCENARIOS.map(s => (
                <button
                  key={s.id}
                  onClick={() => startScenario(s)}
                  style={{
                    background: 'rgba(250,252,255,0.92)',
                    border: '1px solid rgba(99,150,222,0.22)',
                    borderRadius: '1.25rem',
                    padding: '2rem 1.5rem',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'border-color 0.15s, box-shadow 0.15s, transform 0.15s',
                    boxShadow: '0 4px 24px rgba(99,150,222,0.10)',
                    backdropFilter: 'blur(8px)',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = s.color; e.currentTarget.style.boxShadow = `0 4px 20px ${s.color}25`; e.currentTarget.style.transform = 'translateY(-2px)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(99,150,222,0.22)'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(99,150,222,0.10)'; e.currentTarget.style.transform = 'translateY(0)' }}
                >
                  <div style={{ width: '3rem', height: '3rem', borderRadius: '0.75rem', background: `${s.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                    <Icon name={s.icon} size={24} style={{ color: s.color }} />
                  </div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1A3558', margin: '0 0 0.35rem', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>{s.name}</h3>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#3D5A80', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>10 Questions</div>
                  <p style={{ fontSize: '0.85rem', color: '#3D5A80', lineHeight: 1.6, margin: '0 0 1rem' }}>{s.desc}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', fontWeight: 700, color: s.color }}>
                    Start Quiz <Icon name="arrowRight" size={14} />
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* How it works */}
          <section style={{ padding: '0 1.5rem 3.5rem', maxWidth: '64rem', margin: '0 auto', width: '100%' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1A3558', textAlign: 'center', marginBottom: '1.5rem', fontFamily: "'Fraunces', Georgia, serif" }}>How It Works</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
              {[
                { step: '1', title: 'Choose a Disaster', desc: 'Select from 8 disaster types — each with 10 scenario-based questions.' },
                { step: '2', title: 'Answer Questions', desc: 'Face realistic emergency situations and choose the best response under pressure.' },
                { step: '3', title: 'Get Your Grade', desc: 'Receive a preparedness grade with financial insights and expert safety tips.' },
              ].map(h => (
                <div key={h.step} style={{ background: 'rgba(250,252,255,0.92)', border: '1px solid rgba(99,150,222,0.22)', borderRadius: '1.25rem', padding: '1.75rem', textAlign: 'center', backdropFilter: 'blur(8px)', boxShadow: '0 4px 24px rgba(99,150,222,0.08)' }}>
                  <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '50%', background: '#0C1A2E', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1.1rem', margin: '0 auto 0.75rem' }}>{h.step}</div>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1A3558', margin: '0 0 0.4rem', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>{h.title}</h3>
                  <p style={{ fontSize: '0.8rem', color: '#3D5A80', lineHeight: 1.5, margin: 0 }}>{h.desc}</p>
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      {/* ── Intro Countdown ── */}
      {phase === 'intro' && selected && (
        <div style={{
          flex: 1,
          background: selected.bg,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '2rem',
          animation: 'simFadeIn 0.5s ease-out',
        }}>
          <Icon name={selected.icon} size={64} style={{ color: selected.color, marginBottom: '1.5rem', opacity: 0.7 }} />
          <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#fff', margin: '0 0 0.5rem' }}>{selected.name} Quiz</h2>
          <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.7)', maxWidth: '30rem', lineHeight: 1.6, margin: '0 0 2rem' }}>{selected.desc}</p>
          <div style={{
            fontSize: '5rem',
            fontWeight: 900,
            color: selected.color,
            textShadow: `0 0 40px ${selected.color}80`,
            animation: 'countPulse 1s ease-in-out infinite',
          }}>
            {introCountdown > 0 ? introCountdown : 'GO'}
          </div>
        </div>
      )}

      {/* ── Quiz ── */}
      {phase === 'sim' && selected && (
        <div
          ref={containerRef}
          style={{
            flex: 1,
            background: selected.bg,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '2rem 1.5rem',
            animation: 'simFadeIn 0.4s ease-out',
            transform: `translate(${shakeIntensity}px, ${shakeIntensity * 0.5}px)`,
            transition: shakeIntensity === 0 ? 'transform 0.3s ease-out' : 'none',
          }}
        >
          {/* Progress bar */}
          <div style={{ width: '100%', maxWidth: '40rem', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Question {stepIndex + 1} of {selected.steps.length}
              </span>
              <button onClick={reset} style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Exit</button>
            </div>
            <div style={{ height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${((stepIndex + (answered ? 1 : 0)) / selected.steps.length) * 100}%`, background: selected.color, borderRadius: '2px', transition: 'width 0.5s ease-out' }} />
            </div>
          </div>

          {/* Question */}
          <div style={{ width: '100%', maxWidth: '40rem' }}>
            <div style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(10px)', borderRadius: '1rem', padding: '2rem', border: '1px solid rgba(255,255,255,0.08)', marginBottom: '1.5rem' }}>
              <p style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff', lineHeight: 1.6, margin: 0 }}>
                {selected.steps[stepIndex].text}
              </p>
            </div>

            {/* Options */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {selected.steps[stepIndex].options.map((opt, i) => {
                const isChosen = answered?.index === i
                const isRevealed = answered !== null
                const optBg = !isRevealed
                  ? 'rgba(255,255,255,0.06)'
                  : isChosen
                    ? opt.score >= 80 ? 'rgba(16,185,129,0.2)' : opt.score >= 50 ? 'rgba(245,158,11,0.2)' : 'rgba(239,68,68,0.2)'
                    : 'rgba(255,255,255,0.03)'
                const optBorder = !isRevealed
                  ? 'rgba(255,255,255,0.1)'
                  : isChosen
                    ? opt.score >= 80 ? '#10b981' : opt.score >= 50 ? '#f59e0b' : '#ef4444'
                    : 'rgba(255,255,255,0.05)'

                return (
                  <button
                    key={i}
                    onClick={() => !answered && handleAnswer(opt, i)}
                    disabled={!!answered}
                    style={{
                      background: optBg,
                      border: `1.5px solid ${optBorder}`,
                      borderRadius: '0.75rem',
                      padding: '1rem 1.25rem',
                      textAlign: 'left',
                      cursor: answered ? 'default' : 'pointer',
                      transition: 'background 0.15s, border-color 0.15s, transform 0.1s',
                      opacity: isRevealed && !isChosen ? 0.5 : 1,
                      transform: isChosen ? 'scale(1.01)' : 'scale(1)',
                    }}
                    onMouseEnter={e => { if (!answered) { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)' } }}
                    onMouseLeave={e => { if (!answered) { e.currentTarget.style.background = optBg; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)' } }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                      <div style={{
                        width: '1.5rem', height: '1.5rem', borderRadius: '50%', flexShrink: 0,
                        border: `2px solid ${isRevealed && isChosen ? optBorder : 'rgba(255,255,255,0.3)'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: isRevealed && isChosen ? optBorder : 'transparent',
                        marginTop: '1px',
                      }}>
                        {isChosen && <Icon name="check" size={12} style={{ color: '#fff' }} />}
                      </div>
                      <span style={{ fontSize: '0.95rem', color: '#fff', fontWeight: 500, lineHeight: 1.5 }}>{opt.label}</span>
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Feedback */}
            {answered && (
              <div style={{
                background: 'rgba(0,0,0,0.3)',
                borderRadius: '0.75rem',
                padding: '1.25rem',
                marginTop: '1.25rem',
                border: `1px solid ${answered.score >= 80 ? '#10b98140' : answered.score >= 50 ? '#f59e0b40' : '#ef444440'}`,
                animation: 'simFadeIn 0.3s ease-out',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <Icon name={answered.score >= 80 ? 'check' : 'warning'} size={16} style={{ color: answered.score >= 80 ? '#10b981' : answered.score >= 50 ? '#f59e0b' : '#ef4444' }} />
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: answered.score >= 80 ? '#10b981' : answered.score >= 50 ? '#f59e0b' : '#ef4444', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    {answered.score >= 80 ? 'Great Choice' : answered.score >= 50 ? 'Partially Correct' : 'Risky Decision'}
                  </span>
                </div>
                <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)', lineHeight: 1.6, margin: 0 }}>{answered.feedback}</p>
              </div>
            )}

            {/* Next button */}
            {answered && (
              <button
                onClick={nextStep}
                style={{
                  marginTop: '1.5rem',
                  width: '100%',
                  background: selected.color,
                  color: '#fff',
                  border: 'none',
                  borderRadius: '0.625rem',
                  padding: '0.875rem',
                  fontSize: '1rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'opacity 0.15s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  animation: 'simFadeIn 0.3s ease-out',
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                {stepIndex + 1 >= selected.steps.length ? 'View Results' : 'Next Question'} <Icon name="arrowRight" size={16} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Results ── */}
      {phase === 'result' && selected && (
        <div style={{
          flex: 1,
          background: selected.bg,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '3rem 1.5rem',
          animation: 'simFadeIn 0.5s ease-out',
        }}>
          <div style={{ width: '100%', maxWidth: '40rem', textAlign: 'center' }}>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff', margin: '0 0 0.5rem' }}>Quiz Complete</h2>
            <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.6)', margin: '0 0 2rem' }}>{selected.name} Awareness Report</p>

            {/* Grade circle */}
            <div style={{
              width: '8rem', height: '8rem', borderRadius: '50%',
              border: `4px solid ${gradeColor}`,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1.5rem',
              boxShadow: `0 0 30px ${gradeColor}40`,
            }}>
              <div style={{ fontSize: '3rem', fontWeight: 900, color: gradeColor, lineHeight: 1 }}>{grade}</div>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'rgba(255,255,255,0.5)' }}>{totalScore}/100</div>
            </div>

            {/* Step breakdown */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '2rem', textAlign: 'left' }}>
              {scores.map((s, i) => (
                <div key={i} style={{ background: 'rgba(0,0,0,0.25)', borderRadius: '0.625rem', padding: '0.75rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>Question {i + 1}</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, color: s >= 80 ? '#10b981' : s >= 50 ? '#f59e0b' : '#ef4444' }}>{s}/100</span>
                </div>
              ))}
            </div>

            {/* Financial insight */}
            <div style={{
              background: 'rgba(212,160,23,0.1)',
              border: '1px solid rgba(212,160,23,0.25)',
              borderRadius: '0.875rem',
              padding: '1.25rem',
              marginBottom: '2rem',
              textAlign: 'left',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <Icon name="dollar" size={16} style={{ color: '#d4a017' }} />
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#d4a017', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Financial Insight</span>
              </div>
              <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.75)', lineHeight: 1.6, margin: 0 }}>{selected.financialInsight}</p>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              <button
                onClick={() => startScenario(selected)}
                style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '0.625rem', padding: '0.75rem 1.5rem', fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer', transition: 'background 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
              >
                Retry Quiz
              </button>
              <button
                onClick={reset}
                style={{ background: selected.color, color: '#fff', border: 'none', borderRadius: '0.625rem', padding: '0.75rem 1.5rem', fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer', transition: 'opacity 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                Try Another Disaster
              </button>
            </div>
          </div>
        </div>
      )}

      {phase === 'select' && <Footer />}

      <style>{`
        @keyframes simFadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes countPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.15); }
        }
      `}</style>
    </div>
  )
}
