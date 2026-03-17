"""
TreeTrace Education Module
Learn about dendrochronology
"""

import streamlit as st

st.set_page_config(page_title="Education - TreeTrace", page_icon="📚", layout="wide")

st.title("📚 Education Center")

st.markdown("---")

tab1, tab2, tab3, tab4 = st.tabs([
    "🌲 What Are Tree Rings?",
    "🔬 How Detection Works",
    "🌡️ Climate Connections",
    "📖 Glossary"
])

with tab1:
    st.markdown("""
    ## 🌲 What Are Tree Rings?
    
    Tree rings are layers of wood produced by a tree each year. They appear as 
    concentric circles when you cut through a tree trunk.
    
    ### How Rings Form
    
    - **Spring/Early Summer (Earlywood):** Rapid growth produces large, light-colored cells
    - **Late Summer/Fall (Latewood):** Slower growth produces small, dense, dark cells
    - **Winter:** Growth stops completely
    
    This cycle creates one ring per year, consisting of a light band and a dark band.
    
    ### What Rings Tell Us
    
    | Ring Feature | Meaning |
    |---|---|
    | **Wide ring** | Good growing conditions (plenty of water, warm) |
    | **Narrow ring** | Stress year (drought, cold, disease) |
    | **Even rings** | Stable, consistent conditions |
    | **Uneven rings** | Variable or changing conditions |
    | **Dark scar** | Fire damage |
    | **Missing ring** | Extreme stress (rare) |
    
    ### Counting Rings = Counting Years
    
    Each ring represents one year of growth. By counting rings from the center (pith) 
    to the bark, you can determine the tree's age.
    
    > 🌲 **Fun Fact:** The oldest known tree (a bristlecone pine named "Methuselah") 
    > is over 4,850 years old!
    """)

with tab2:
    st.markdown("""
    ## 🔬 How TreeTrace Detects Rings
    
    TreeTrace uses the **CS-TRD** (Cross-Section Tree Ring Detection) algorithm, 
    published in Image Processing On Line (IPOL) in 2025.
    
    ### The Algorithm Pipeline
    
    ```
    1. 📷 Input Image
       ↓
    2. 🔲 Preprocessing (grayscale, normalization)
       ↓
    3. ✏️ Canny-Devernay Edge Detection
       ↓
    4. 🔍 Edge Filtering (keep ring-relevant edges)
       ↓
    5. 📡 Ray Sampling (360 rays from pith center)
       ↓
    6. 🔗 Chain Merging (connect edge segments)
       ↓
    7. ✨ Postprocessing (clean and validate rings)
       ↓
    8. 📊 Output (ring boundaries as polygons)
    ```
    
    ### Key Concepts
    
    **Pith:** The center of the tree trunk. All rings radiate outward from here.
    
    **Edge Detection:** The algorithm finds boundaries between light (earlywood) 
    and dark (latewood) regions.
    
    **Ray Sampling:** 360 rays are cast from the pith outward (like spokes of a wheel) 
    to find where they cross ring boundaries.
    
    ### Performance
    
    | Metric | Score |
    |---|---|
    | Precision | 91% (few false detections) |
    | Recall | 73% (finds most rings) |
    | F1 Score | 0.81 (overall accuracy) |
    """)

with tab3:
    st.markdown("""
    ## 🌡️ Climate Connections
    
    Tree rings are natural archives of past climate. By studying ring patterns, 
    scientists can reconstruct climate conditions going back thousands of years.
    
    ### How Climate Affects Growth
    
    | Climate Factor | Effect on Rings |
    |---|---|
    | **Wet years** | Wider rings (more water = more growth) |
    | **Drought** | Narrow rings (water stress) |
    | **Warm spring** | Earlier growth start, wider rings |
    | **Late frost** | Damaged cells, possible frost ring |
    | **Volcanic eruptions** | Cooling → narrow rings globally |
    | **El Niño/La Niña** | Regional effects on precipitation |
    
    ### Famous Climate Events in Tree Rings
    
    - **1816 "Year Without Summer"**: Mount Tambora eruption caused global cooling. 
      Trees worldwide show narrow rings this year.
    
    - **Medieval Warm Period (900-1300)**: Wide rings across Europe indicate 
      warmer, wetter conditions.
    
    - **Little Ice Age (1300-1850)**: Narrow rings indicate cooler conditions.
    
    - **Dust Bowl (1930s)**: Trees in the US Great Plains show extreme narrow rings.
    
    ### Dendroclimatology
    
    Scientists use tree rings to:
    1. **Reconstruct** past temperatures and rainfall
    2. **Calibrate** climate models
    3. **Predict** future climate impacts
    4. **Identify** drought patterns and cycles
    
    > 🌡️ **Did you know?** Tree ring records have been used to reconstruct 
    > temperatures going back over 7,000 years!
    """)

with tab4:
    st.markdown("""
    ## 📖 Dendrochronology Glossary
    
    | Term | Definition |
    |---|---|
    | **Dendrochronology** | The science of dating tree rings |
    | **Pith** | The center of the tree trunk |
    | **Earlywood** | Light-colored wood formed in spring (rapid growth) |
    | **Latewood** | Dark-colored wood formed in summer/fall (slow growth) |
    | **Annual Ring** | One year's growth (earlywood + latewood) |
    | **Cross-dating** | Matching ring patterns between trees to verify dates |
    | **Chronology** | A dated sequence of ring widths from a region |
    | **Marker Year** | A year with distinctive ring width across many trees |
    | **False Ring** | An extra growth band caused by mid-season drought |
    | **Missing Ring** | A year when no ring was formed (extreme stress) |
    | **Fire Scar** | Damage mark in rings caused by fire |
    | **Compression Wood** | Denser wood on the lower side of leaning trees |
    | **PDSI** | Palmer Drought Severity Index (drought measure) |
    | **Detrending** | Removing age-related growth trends |
    | **Standardization** | Converting ring widths to comparable indices |
    | **EPS** | Expressed Population Signal (chronology quality measure) |
    | **COFECHA** | Software for cross-dating quality control |
    | **Tucson Format** | Standard file format for ring width data (.rwl) |
    """)